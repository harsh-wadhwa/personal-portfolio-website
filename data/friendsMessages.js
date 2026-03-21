/**
 * Hardcoded copy for /friends, signup, and entry modals. Edit here only.
 */

// --- Signup modal ---
export const FRIENDS_SIGNUP_MODAL_TITLE = 'Request access'

export const MESSAGE_TO_FRIEND_SIGNUP_MODAL =
  "Hey, it's me. I'll need this data to approve your user. I am opening this for friends only."

export const MESSAGE_FRIEND_SIGNUP_AFTER_SUBMIT = `Due to safety reasons, I want to approve accounts manually for now. When it's done, your username will start appearing on the public list and only you will be able to make entries (note that entered data is public). I plan to have a look every Sunday. Ping me if you want to try it earlier.`

export const FRIENDS_SIGNUP_LABEL_USERNAME = 'Username'
export const FRIENDS_SIGNUP_HINT_USERNAME = 'Lowercase a-z and 0-9 only.'
export const FRIENDS_SIGNUP_USERNAME_INPUT_TITLE = 'Lowercase letters and numbers only, 2-32 characters'

export const FRIENDS_SIGNUP_LABEL_PASSWORD = 'Password'

export const FRIENDS_SIGNUP_LABEL_KNOW_ME = 'How do we know each other?'
export const FRIENDS_SIGNUP_PLACEHOLDER_KNOW_ME = 'Context helps me approve you quickly…'
export const FRIENDS_SIGNUP_HINT_KNOW_ME = 'At least 20 characters. This is only visible to the site owner.'

export const FRIENDS_SIGNUP_BUTTON_SUBMIT = 'Submit request'
export const FRIENDS_SIGNUP_BUTTON_SUBMITTING = 'Submitting…'
export const FRIENDS_SIGNUP_BUTTON_CANCEL = 'Cancel'
export const FRIENDS_SIGNUP_BUTTON_CLOSE = 'Close'

export const FRIENDS_SIGNUP_ERROR_REQUEST_FAILED = 'Request failed'
export const FRIENDS_SIGNUP_ERROR_NETWORK = 'Network error'

// --- Entry modal ---
export const FRIENDS_ENTRY_MODAL_TITLE = 'Log day'

/** Render with <code> for `passwordScrypt` and `rules.approved` via FRIENDS_ENTRY_MODAL_INTRO_PARTS */
export const FRIENDS_ENTRY_MODAL_INTRO_PARTS = [
  { type: 'text', value: "Enter this user's login password (checked against " },
  { type: 'code', value: 'passwordScrypt' },
  { type: 'text', value: ' on the roster). Only ' },
  { type: 'code', value: 'rules.approved: true' },
  { type: 'text', value: ' users can save. Use HTTPS in production.' },
]

export const FRIENDS_ENTRY_LABEL_USERNAME = 'Username'
export const FRIENDS_ENTRY_LABEL_PASSWORD = 'Password for this user'
export const FRIENDS_ENTRY_LABEL_DAY = 'Day'

export const FRIENDS_ENTRY_PLACEHOLDER_METRIC_EMPTY = 'Leave empty for —'

export const FRIENDS_ENTRY_BUTTON_SAVE = 'Save'
export const FRIENDS_ENTRY_BUTTON_SAVING = 'Saving…'
export const FRIENDS_ENTRY_BUTTON_CANCEL = 'Cancel'

export const FRIENDS_ENTRY_ERROR_NOT_APPROVED_FALLBACK =
  'Your account is not approved yet. The site owner must set rules.approved to true on your friends document in MongoDB.'
export const FRIENDS_ENTRY_ERROR_REQUEST_FAILED = 'Request failed'
export const FRIENDS_ENTRY_ERROR_NETWORK = 'Network error'

// --- /friends page ---
export const FRIENDS_PAGE_HEADING = 'Tracking'

export const FRIENDS_PAGE_LABEL_USER = 'User'
export const FRIENDS_PAGE_USER_OPTION_CHOOSE = 'Choose…'
export const FRIENDS_PAGE_USER_OPTION_SELECT = 'Select'
export const FRIENDS_PAGE_USER_ONE_TIME_HINT = 'One-time on this device: pick your username'

export const FRIENDS_PAGE_BUTTON_REQUEST_ACCESS = 'Request access'
export const FRIENDS_PAGE_BUTTON_LOG_ENTRY = 'Log entry'

export const FRIENDS_PAGE_WEEK_OF_PREFIX = 'Week of '
export const FRIENDS_PAGE_LINK_PREV_WEEK = '← Previous week'
export const FRIENDS_PAGE_LINK_THIS_WEEK = 'This week'
export const FRIENDS_PAGE_LINK_NEXT_WEEK = 'Next week →'

export const FRIENDS_PAGE_SEO_DESCRIPTION = 'Weekly activity tracker (steps, macros, training, and more).'

/** Use as: `${FRIENDS_PAGE_SEO_TITLE_PREFIX} - ${author}` */
export const FRIENDS_PAGE_SEO_TITLE_PREFIX = 'Friends — activity tracker'

export const FRIENDS_PAGE_ERROR_LOAD_FAILED =
  'Something went wrong loading this page. If you use MongoDB, check MONGODB_URI and the server terminal for errors.'

export const FRIENDS_PAGE_MONGO_NOT_CONFIGURED_BEFORE = 'MongoDB is not configured ('
export const FRIENDS_PAGE_MONGO_NOT_CONFIGURED_CODE = 'MONGODB_URI'
export const FRIENDS_PAGE_MONGO_NOT_CONFIGURED_AFTER =
  '). The table shows empty rows until you connect a database.'

export const FRIENDS_PAGE_NO_APPROVED_FRIENDS_BEFORE = 'No approved friends on the public list yet. Use '
export const FRIENDS_PAGE_NO_APPROVED_FRIENDS_STRONG = 'Request access'
export const FRIENDS_PAGE_NO_APPROVED_FRIENDS_AFTER = ' to sign up — you’ll be asked how we know each other.'

/** When FRIENDS_DISABLE_SIGNUP=1 */
export const FRIENDS_PAGE_NO_APPROVED_SIGNUP_CLOSED =
  'No approved friends on the public list yet. New signups are closed. Contact the site owner if you need access.'

export const FRIENDS_PAGE_ROSTER_LOAD_ERROR = 'Could not load the user list. Refresh or try again later.'

export const FRIENDS_PAGE_RATE_LIMIT_TRY_AGAIN = (secondsRounded) =>
  `Too many requests. Try again in about ${secondsRounded}s.`

export const FRIENDS_PAGE_LOADING_USERS = 'Loading users…'
export const FRIENDS_PAGE_LOADING_WEEK = 'Loading this week…'
export const FRIENDS_PAGE_CHOOSE_USERNAME_BANNER =
  'Choose your username above (one time on this browser). After that, we’ll load your week automatically.'

export const FRIENDS_PAGE_TABLE_SELECT_USER = 'Select your username to see the table.'

export const FRIENDS_CHARTS_LOADING = 'Loading charts…'

export const FRIENDS_TABLE_HEADING_DATE = 'Date'
export const FRIENDS_OPTION_YES = 'Yes'
export const FRIENDS_OPTION_NO = 'No'
