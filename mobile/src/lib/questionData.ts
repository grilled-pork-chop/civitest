/**
 * Statically bundled question data.
 *
 * Metro requires literal `require` strings, so each of the 12 files is listed
 * explicitly. The JSON is inlined into the JS bundle — no network access needed,
 * keeping the app fully offline.
 */

export const QUESTION_DATA: Record<string, unknown> = {
  'pv_questions.json': require('../../assets/data/pv_questions.json'),
  'sip_questions.json': require('../../assets/data/sip_questions.json'),
  'dd_questions.json': require('../../assets/data/dd_questions.json'),
  'hgc_questions.json': require('../../assets/data/hgc_questions.json'),
  'vsf_questions.json': require('../../assets/data/vsf_questions.json'),
  'pv_x_questions.json': require('../../assets/data/pv_x_questions.json'),
  'sip_x_questions.json': require('../../assets/data/sip_x_questions.json'),
  'dd_x_questions.json': require('../../assets/data/dd_x_questions.json'),
  'hgc_x_questions.json': require('../../assets/data/hgc_x_questions.json'),
  'vsf_x_questions.json': require('../../assets/data/vsf_x_questions.json'),
  'pv_s_questions.json': require('../../assets/data/pv_s_questions.json'),
  'dd_s_questions.json': require('../../assets/data/dd_s_questions.json'),
};
