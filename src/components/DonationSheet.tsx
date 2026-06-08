import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  initConnection,
  type Purchase,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
} from 'react-native-iap';
import { Tricolor } from '@/components/ui/Tricolor';
import { useThemeColors } from '@/theme/useTheme';
import { fonts, fontSize, spacing } from '@/theme/tokens';

const SCREEN_W = Dimensions.get('window').width;

const AMOUNT_OPTIONS = [
  { id: 'coffee', amount: '1,99 €', icon: '☕', label: 'Un café', note: 'Un geste simple pour continuer' },
  { id: 'lunch', amount: '4,99 €', icon: '🥗', label: 'Un déjeuner', note: 'Pour les prochaines mises à jour' },
  { id: 'restaurant', amount: '9,99 €', icon: '🍝', label: 'Un repas', note: 'Un grand merci sincère' },
] as const;

const SKU_MAP = {
  coffee: 'com.grilledporkchop.civitest.tip_coffee',
  lunch: 'com.grilledporkchop.civitest.tip_lunch',
  restaurant: 'com.grilledporkchop.civitest.tip_restaurant',
} as const;

// Blue/red tricolor confetti (skip white — invisible on light background)
const CONFETTI_PIECES = [
  { color: '#002654', offset: 0.10 },
  { color: '#ce1126', offset: 0.28 },
  { color: '#002654', offset: 0.50 },
  { color: '#ce1126', offset: 0.68 },
  { color: '#002654', offset: 0.86 },
] as const;

export default function DonationSheet({ onClose }: { onClose: () => void }) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [chosen, setChosen] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [iapError, setIapError] = useState<string | null>(null);
  // null = still connecting, true = billing ready, false = unavailable (e.g. a
  // sideloaded APK where Google Play billing can't connect).
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    let purchaseUpdate: ReturnType<typeof purchaseUpdatedListener> | null = null;
    let purchaseErr: ReturnType<typeof purchaseErrorListener> | null = null;

    initConnection()
      .then(async () => {
        await fetchProducts({ skus: Object.values(SKU_MAP), type: 'in-app' });

        purchaseUpdate = purchaseUpdatedListener(async (purchase: Purchase) => {
          if (purchase.purchaseToken) {
            await finishTransaction({ purchase, isConsumable: true });
            setPurchasing(false);
            setDone(true);
          }
        });
        purchaseErr = purchaseErrorListener((error) => {
          const code = (error as { code?: string }).code;
          if (code !== 'E_USER_CANCELLED') {
            setIapError((error as { message?: string }).message ?? 'Une erreur est survenue.');
          }
          setPurchasing(false);
        });
        setAvailable(true);
      })
      .catch(() => setAvailable(false));

    return () => {
      purchaseUpdate?.remove();
      purchaseErr?.remove();
      void endConnection();
    };
  }, []);

  const confettiAnims = useRef(CONFETTI_PIECES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!done) return;
    const loops = confettiAnims.map((anim, i) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(i * 100),
          Animated.timing(anim, { toValue: 1, duration: 900 + i * 120, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
      loop.start();
      return loop;
    });
    return () => loops.forEach((l) => l.stop());
  }, [done, confettiAnims]);

  async function handlePay() {
    if (!chosen || purchasing || available === false) return;
    setIapError(null);
    setPurchasing(true);
    try {
      const sku = SKU_MAP[chosen as keyof typeof SKU_MAP];
      await requestPurchase({
        type: 'in-app',
        request: { apple: { sku }, google: { skus: [sku] } },
      });
    } catch {
      setPurchasing(false);
    }
  }

  const selectedAmount = AMOUNT_OPTIONS.find((a) => a.id === chosen);

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={s.overlay}
        onPress={purchasing ? undefined : onClose}
        accessibilityRole="button"
        accessibilityLabel="Fermer"
      >
        <Pressable
          style={[s.sheet, { backgroundColor: c.card, paddingBottom: Math.max(insets.bottom + 20, 36) }]}
          onPress={() => {}}
        >
          <View style={[s.handle, { backgroundColor: c.border }]} />
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            {done ? (
              <>
                <View style={s.doneWrap}>
                  <Text style={s.flagEmoji} accessible={false}>🇫🇷</Text>
                </View>
                <View style={s.confettiContainer} pointerEvents="none">
                  {CONFETTI_PIECES.map((piece, i) => (
                    <Animated.View
                      key={i}
                      style={[
                        s.confettiDot,
                        {
                          backgroundColor: piece.color,
                          left: SCREEN_W * piece.offset,
                          transform: [{
                            translateY: confettiAnims[i].interpolate({
                              inputRange: [0, 1],
                              outputRange: [-20, 70],
                            }),
                          }],
                          opacity: confettiAnims[i].interpolate({
                            inputRange: [0, 0.7, 1],
                            outputRange: [1, 1, 0],
                          }),
                        },
                      ]}
                    />
                  ))}
                </View>
                <Tricolor height={3} />
                <Text style={[s.thankTitle, { color: c.foreground }]}>Merci beaucoup !</Text>
                <Text style={[s.thankBody, { color: c.mutedForeground }]}>
                  Votre soutien aide à garder CiviTest gratuit et à jour.
                </Text>
                <Text style={[s.thankQuote, { color: c.mutedForeground }]}>
                  Liberté, Égalité, Fraternité.
                </Text>
                <Pressable
                  style={[s.actionBtn, { backgroundColor: c.primary }]}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Continuer"
                >
                  <Text style={[s.actionBtnText, { color: c.primaryForeground }]}>Continuer</Text>
                </Pressable>
              </>
            ) : available === false ? (
              <>
                <View style={s.sheetHeader}>
                  <Text style={s.flagEmoji} accessible={false}>🇫🇷</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.sheetTitle, { color: c.foreground }]}>Soutenir CiviTest</Text>
                    <Text style={[s.sheetSubtitle, { color: c.mutedForeground }]}>
                      Merci de votre intérêt !
                    </Text>
                  </View>
                </View>
                <Text style={[s.thankBody, { color: c.mutedForeground, textAlign: 'left', marginBottom: 20 }]}>
                  Les pourboires passent par la facturation Google Play et ne sont
                  disponibles que lorsque l’application est installée depuis le Play
                  Store. Cette version ne permet pas les dons, mais toutes les
                  fonctionnalités restent accessibles gratuitement.
                </Text>
                <Pressable
                  style={[s.actionBtn, { backgroundColor: c.primary }]}
                  onPress={onClose}
                  accessibilityRole="button"
                  accessibilityLabel="Continuer"
                >
                  <Text style={[s.actionBtnText, { color: c.primaryForeground }]}>Continuer</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={s.sheetHeader}>
                  <Text style={s.flagEmoji} accessible={false}>🇫🇷</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.sheetTitle, { color: c.foreground }]}>Soutenir CiviTest</Text>
                    <Text style={[s.sheetSubtitle, { color: c.mutedForeground }]}>
                      Un café, un déjeuner ou un repas
                    </Text>
                  </View>
                </View>

                <View style={s.options}>
                  {AMOUNT_OPTIONS.map((a) => (
                    <Pressable
                      key={a.id}
                      style={[
                        s.option,
                        { borderColor: c.border, backgroundColor: c.card },
                        chosen === a.id && { borderWidth: 2, borderColor: c.primary, backgroundColor: `${c.primary}12` },
                      ]}
                      onPress={() => setChosen(a.id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: chosen === a.id }}
                      accessibilityLabel={`${a.label}, ${a.amount}. ${a.note}`}
                    >
                      <Text style={s.optionIcon} accessible={false}>{a.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.optionLabel, { color: c.foreground }]}>{a.label}</Text>
                        <Text style={[s.optionNote, { color: c.mutedForeground }]}>{a.note}</Text>
                      </View>
                      <Text style={[s.optionAmount, { color: chosen === a.id ? c.primary : c.foreground }]}>
                        {a.amount}
                      </Text>
                      {chosen === a.id && (
                        <View style={[s.checkCircle, { backgroundColor: c.primary }]}>
                          <Text style={s.checkMark}>✓</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={[s.actionBtn, { backgroundColor: !chosen || purchasing ? c.muted : c.primary }]}
                  onPress={() => void handlePay()}
                  disabled={!chosen || purchasing}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !chosen || purchasing }}
                  accessibilityLabel={
                    chosen ? `Offrir ${selectedAmount?.amount}` : 'Choisissez un montant'
                  }
                >
                  <Text style={[s.actionBtnText, { color: !chosen || purchasing ? c.mutedForeground : c.primaryForeground }]}>
                    {purchasing
                      ? 'Traitement en cours…'
                      : chosen
                        ? `Offrir ${selectedAmount?.amount}`
                        : 'Choisissez un montant'}
                  </Text>
                </Pressable>

                {iapError ? (
                  <Text style={[s.footerNote, { color: '#ce1126' }]}>{iapError}</Text>
                ) : (
                  <Text style={[s.footerNote, { color: c.mutedForeground }]}>
                    Paiement sécurisé via Apple / Google
                  </Text>
                )}
              </>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,18,32,0.5)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.base },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  doneWrap: { alignItems: 'center', marginBottom: 12 },
  flagEmoji: { fontSize: 48 },
  confettiContainer: { position: 'absolute', top: 44, left: 0, right: 0, height: 80 },
  confettiDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: 0 },
  thankTitle: {
    fontFamily: fonts.display,
    fontSize: fontSize.h1,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 16,
    marginBottom: 8,
  },
  thankBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.body,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 6,
  },
  thankQuote: {
    fontFamily: fonts.displaySemi,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 },
  sheetTitle: { fontFamily: fonts.display, fontSize: fontSize.h2, lineHeight: 24 },
  sheetSubtitle: { fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 18 },
  options: { gap: 8, marginBottom: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1.5,
  },
  optionIcon: { fontSize: 26, width: 36, textAlign: 'center' },
  optionLabel: { fontFamily: fonts.semibold, fontSize: 14 },
  optionNote: { fontFamily: fonts.body, fontSize: 11.5, marginTop: 2 },
  optionAmount: { fontFamily: fonts.medium, fontSize: 18 },
  checkCircle: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionBtn: { borderRadius: 18, padding: spacing.base, alignItems: 'center' },
  actionBtnText: { fontFamily: fonts.semibold, fontSize: 15 },
  footerNote: { textAlign: 'center', fontSize: 10.5, marginTop: 10, fontFamily: fonts.medium },
});
