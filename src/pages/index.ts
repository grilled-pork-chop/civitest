/**
 * Page exports
 * Only export HomePage since other pages are lazy-loaded in the router
 */
export { HomePage } from './HomePage';

// QuizPage, ReviewPage, and StatsPage are lazy-loaded via router
// and should not be exported here to avoid bundling them in the main chunk
