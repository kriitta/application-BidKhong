export type Language = "en" | "th";

export type TranslationKeys = {
  // ─── Common ───
  viewAll: string;
  loading: string;
  error: string;
  cancel: string;
  confirm: string;
  save: string;
  back: string;
  noData: string;
  search: string;
  clear: string;
  clearAll: string;
  filter: string;
  refresh: string;
  retry: string;
  close: string;
  submit: string;
  delete: string;
  edit: string;
  send: string;
  ok: string;
  success: string;
  yes: string;
  no: string;
  language: string;

  // ─── Welcome ───
  welcomeTagline: string;
  welcomeDescription: string;
  activeUsers: string;
  productAuctions: string;
  loginSignup: string;
  browseAsGuest: string;
  featureRealtimeBidding: string;
  featureRealtimeBiddingDesc: string;
  featureAlerts: string;
  featureAlertsDesc: string;
  featureDeals: string;
  featureDealsDesc: string;

  // ─── Auth Modal ───
  login: string;
  loginTitle: string;
  register: string;
  registerTitle: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  forgotPassword: string;
  resetPassword: string;
  sendToken: string;
  enterToken: string;
  newPassword: string;
  noAccount: string;
  haveAccount: string;
  enterEmail: string;
  enterPassword: string;
  enterFullName: string;
  enterNewPassword: string;
  reenterNewPassword: string;
  enterPhone: string;
  enterConfirmPassword: string;
  pdpaTitle: string;
  pdpaAccept: string;
  pdpaContinue: string;

  // ─── Tab Bar ───
  tabHome: string;
  tabWallet: string;
  tabSeller: string;
  tabBids: string;
  tabProfile: string;

  // ─── Home ───
  totalBalance: string;
  searchPlaceholder: string;
  categories: string;
  recommended: string;
  hotBids: string;
  endingSoon: string;
  allProducts: string;
  incoming: string;
  noProducts: string;
  recentSearches: string;
  trending: string;
  signInToBid: string;
  noResults: string;
  searchResults: string;
  result: string;
  results: string;
  timeBadgeEnding: string;
  hotBadge: string;
  endingBadge: string;
  incomingBadge: string;
  minBid: string;

  // ─── Profile ───
  joined: string;
  balance: string;
  pending: string;
  total: string;
  editProfile: string;
  verifyProduct: string;
  myProducts: string;
  helpSupport: string;
  about: string;
  logout: string;
  logoutConfirmTitle: string;
  logoutConfirmMessage: string;
  logoutConfirmYes: string;
  ratingLabel: string;
  reviewsLabel: string;

  // ─── Wallet ───
  walletTitle: string;
  availableBalance: string;
  pendingBalance: string;
  topUp: string;
  withdraw: string;
  transactionHistory: string;
  noTransactions: string;
  justNow: string;
  minAgo: string;
  hoursAgo: string;
  daysAgo: string;
  topUpSuccess: string;
  withdrawSuccess: string;
  amount: string;
  enterAmount: string;
  minAmount: string;

  // ─── My Bids ───
  myBids: string;
  activeBids: string;
  bidHistory: string;
  allBids: string;
  winning: string;
  outbid: string;
  totalBids: string;
  won: string;
  lost: string;
  wonLabel: string;
  lostLabel: string;
  totalLabel: string;
  placeBid: string;
  currentBid: string;
  yourBid: string;
  bidIncrement: string;
  minimumBid: string;
  bidPlaced: string;
  bidFailed: string;
  ended: string;
  searchBids: string;
  noBidsYet: string;
  noBidHistory: string;
  buyNow: string;
  buyNowConfirm: string;

  // ─── Seller ───
  sellerTitle: string;
  listProduct: string;
  productName: string;
  productDescription: string;
  startingPrice: string;
  minBidIncrement: string;
  auctionDuration: string;
  selectCategory: string;
  selectSubcategory: string;
  addImages: string;
  auctionStartTime: string;
  submitProduct: string;
  productSubmitted: string;
  province: string;
  contact: string;

  // ─── My Products ───
  myProductsTitle: string;
  allStatus: string;
  activeStatus: string;
  endedStatus: string;
  shippingStatus: string;
  noProductsYet: string;

  // ─── Verify Product ───
  verifyTitle: string;
  confirmContact: string;
  markReceived: string;
  reportIssue: string;
  allTab: string;
  wonTab: string;
  shippingTab: string;
  doneTab: string;
  expiredTab: string;
  noProductsFound: string;
  seller: string;
  buyer: string;

  // ─── Edit Profile ───
  editProfileTitle: string;
  saveChanges: string;
  changePassword: string;
  changePhoto: string;
  profileUpdated: string;
  tokenSentTo: string;
  enterTokenEmail: string;
  resendToken: string;

  // ─── Help & Support ───
  helpTitle: string;
  faqTab: string;
  reportTab: string;
  reportStatusTab: string;
  faqTitle: string;
  reportTitle: string;
  reportType: string;
  reportDescription: string;
  reportUser: string;
  attachEvidence: string;
  reportSubmitted: string;
  myReports: string;
  reportStatus: string;
  reportPending: string;
  reportResolved: string;
  reportRejected: string;

  // ─── Banned ───
  bannedTitle: string;
  bannedSubtitle: string;
  bannedReason: string;
  bannedUntil: string;
  bannedHelp: string;
  bannedUnknown: string;

  // ─── Product Detail ───
  startingBid: string;
  currentBidLabel: string;
  auctionEnds: string;
  bidNow: string;
  details: string;
  description: string;
  condition: string;
  location: string;
  contactSeller: string;
  aboutSeller: string;
  reviews: string;
  noReviews: string;

  // ─── View All ───
  viewAllTitle: string;
  sortBy: string;
  noItemsFound: string;

  // ─── Category ───
  categoryTitle: string;
  subcategories: string;
  searchInCategory: string;

  // ─── About App ───
  aboutTitle: string;
  aboutVersion: string;
  aboutDescription: string;

  // Auth loading & misc
  rememberPassword: string;
  loggingIn: string;
  creatingAccount: string;
  sendingReset: string;
  resettingPwd: string;
  pleaseWait: string;
  resetToken: string;
  newPasswordLabel: string;

  // Edit Profile
  personalInfo: string;
  resetPasswordSection: string;
  sendTokenToEmail: string;
  resendIn: string;
  sentTokenToEmail: string;
  token: string;
  confirmNewPassword: string;
  savingDots: string;
  sendingToken: string;
  resettingPassword: string;
  profileUpdatedSuccess: string;
  unsavedChanges: string;
  unsavedChangesMsg: string;
  stay: string;
  discard: string;
  tokenSentTitle: string;
  tokenSentMsg: string;
  errEnterFullName: string;
  errEnterEmail: string;
  errValidEmail: string;
  errEnterPhone: string;
  errEnterToken: string;
  errEnterNewPwd: string;
  errPwdLength: string;
  errPwdNoMatch: string;
  pwdChangedSuccess: string;
  permissionRequired: string;
  permissionPhotoMsg: string;
  profilePicUploaded: string;
  resetPwdInfo: string;

  // Seller
  sellerModeTitle: string;
  sellerModeSubtitle: string;
  createAuction: string;
  productPhotos: string;
  cover: string;
  firstPhotoCover: string;
  addPhoto: string;
  productTitle: string;
  category: string;
  subcategory: string;
  descriptionStar: string;
  locationStar: string;
  pricing: string;
  startingBidStar: string;
  bidIncrementStar: string;
  buyoutPrice: string;
  buyoutPriceInfo: string;
  auctionStartDateTime: string;
  auctionEndDateTime: string;
  auctionStartsSummary: string;
  auctionEndsSummary: string;
  at: string;
  certificate: string;
  certOptional: string;
  certInfo: string;
  uploadCertificate: string;
  certHint: string;
  change: string;
  remove: string;
  cancelPicker: string;
  donePicker: string;
  startDate: string;
  startTime: string;
  selectDate: string;
  selectTime: string;
  creatingAuction: string;
  creatingAuctionSub: string;
  auctionCreatedSuccess: string;
  auctionCreatedSub: string;
  auctionError: string;
  reqTitle: string;
  reqCategorySub: string;
  reqDescription: string;
  reqStartingBid: string;
  reqLocation: string;
  reqStartDateTime: string;
  reqEndDateTime: string;
  errInvalidTime: string;

  // ─── Verify Product ───
  verifyProductTitle: string;
  tabAll: string;
  tabWon: string;
  tabShipping: string;
  tabDone: string;
  tabProblem: string;
  loadingOrders: string;
  noOrdersFound: string;
  noWonAuctions: string;
  noOrdersInStatus: string;
  wonOn: string;
  orderDetails: string;
  winningPrice: string;
  orderProgress: string;
  wonAuction: string;
  receivedItem: string;
  sellerContact: string;
  confirmContactNote: string;
  productReceived: string;
  completedTitle: string;
  completedSub: string;
  underDispute: string;
  waitingSellerShip: string;
  waitingDelivery: string;
  waitingSellerShipDesc: string;
  waitingDeliveryDesc: string;
  verificationDeadlinePassed: string;
  timeRemainingToVerify: string;
  hrs: string;
  min: string;
  sec: string;
  statusWon: string;
  statusConfirmed: string;
  statusShipped: string;
  statusCompleted: string;
  statusDisputed: string;
  statusCancelled: string;
  statusExpired: string;
  statusUnknown: string;
  orderExpired: string;
  orderCancelled: string;
  orderExpiredSub: string;
  orderCancelledSub: string;
  reviewTitle: string;
  submitReview: string;
  reviewCommentPlaceholder: string;
  rateSellerTitle: string;
  disputeTitle: string;
  disputeReasonPlaceholder: string;
  uploadEvidence: string;
  submitDispute: string;

  // ─── My Products ───
  tabIncoming: string;
  tabActive: string;
  tabEnded: string;
  tabHot: string;
  tagEnding: string;
  tagActive: string;
  tagShipping: string;
  bids: string;

  // ─── Help & Support ───
  helpSupportTitle: string;
  tabFaq: string;
  tabReport: string;
  tabStatus: string;
  adminName: string;

  // ─── Product Detail ───
  productNotFound: string;
  goBack: string;
  unknownSeller: string;
  tagHot: string;
  tagEndingSoon: string;
  tagIncoming: string;
  tagCertified: string;
  tagPendingCert: string;
  upcomingAuction: string;
  auctionNotStarted: string;
  buyoutPriceLabel: string;
  minimumIncrement: string;
  soldBoughtNow: string;
  auctionEnded: string;
  auctionEndedSub: string;
  placeYourBid: string;
  bid: string;
  auctionInformation: string;
  starts: string;
  ends: string;
  startsIn: string;
  timeRemaining: string;
  mAgo: string;
  hAgo: string;
  dAgo: string;

  // ─── View All ───
  hotAuctions: string;
  allProduct: string;
  incomingAuctions: string;
  allAuctions: string;
  searchIn: string;
  aiPick: string;
  tryAdjustSearch: string;

  // ─── Category ───
  noSubcategoriesFound: string;
  noProductsInSub: string;

  // ─── History Filter Modal ───
  filterHistory: string;
  filterPeriodSubtitle: string;
  yearLabel: string;
  monthLabel: string;
  allMonths: string;
  selectedFilter: string;
  allYearPrefix: string;
  applyFilter: string;
  txTypeAll: string;
  txTypeDeposit: string;
  txTypeWithdraw: string;
  txTypeWon: string;
  txTypeBid: string;
  txTypeRefund: string;
  monthJan: string;
  monthFeb: string;
  monthMar: string;
  monthApr: string;
  monthMay: string;
  monthJun: string;
  monthJul: string;
  monthAug: string;
  monthSep: string;
  monthOct: string;
  monthNov: string;
  monthDec: string;
  monthJanS: string;
  monthFebS: string;
  monthMarS: string;
  monthAprS: string;
  monthMayS: string;
  monthJunS: string;
  monthJulS: string;
  monthAugS: string;
  monthSepS: string;
  monthOctS: string;
  monthNovS: string;
  monthDecS: string;

  // ─── TopUp Modal ───
  topUpWallet: string;
  paymentDetails: string;
  selectAmount: string;
  enterCustomAmount: string;
  paymentMethod: string;
  scanQrToPay: string;
  scanQrSub: string;
  amountToPay: string;
  transferViaMobileBanking: string;
  transferViaMobileBankingSub: string;
  selectBankToTransfer: string;
  accountNameLabel: string;
  uploadPaymentSlip: string;
  tapToUploadSlip: string;
  supportedFormats: string;
  errEnterTopUpAmount: string;
  errUploadSlip: string;
  slipSubmitFailed: string;

  // ─── Withdraw Modal ───
  selectBank: string;
  enterAmountMin100: string;
  promptPayNumberLabel: string;
  bankAccountNumberLabel: string;
  phoneNumberPlaceholder: string;
  bankAccountPlaceholder: string;
  accountHolderName: string;
  accountHolderPlaceholder: string;
  errMinWithdraw: string;
  errPromptPayFormat: string;
  errBankAccountFormat: string;
  errAccountHolderName: string;
  processing: string;
  confirmWithdraw: string;
  withdrawPendingNote: string;
  genericRetryError: string;

  // ─── About App (extended) ───
  aboutStatUsers: string;
  aboutStatProducts: string;
  aboutStatSafe: string;
  aboutHowToUse: string;
  aboutHowToUseSub: string;
  aboutFeatureTitle: string;
  aboutFaqSection: string;
  aboutAppDesc: string;

  // ─── Admin ───
  adminReports: string;
  adminUsers: string;
  adminAuctions: string;
  adminWithdrawals: string;
  approved: string;
  rejected: string;
  approve: string;
  reject: string;
  reportDismissed: string;
  days: string;
  adminConfirmWithdrawTitle: string;
  adminConfirmWithdrawMsg: string;
  adminWithdrawConfirmed: string;
  adminCannotConfirm: string;
  adminEnterReason: string;
  adminSpecifyRejectReason: string;
  adminWithdrawRejected: string;
  adminCannotReject: string;
  adminEnterBanReason: string;
  adminEnterValidDays: string;
  adminBanSuccess: string;
  adminCannotBan: string;
  adminUnbanConfirmMsg: string;
  adminUnbanSuccess: string;
  adminCannotUnban: string;
  adminEnterRejectReason: string;
  adminProductRejected: string;
  adminCannotRejectProduct: string;
  adminApproveProduct: string;
  adminApproveConfirmMsg: string;
  adminProductApproved: string;
  adminCannotApprove: string;
  adminCertApproved: string;
  adminCertRejected: string;
  adminCannotProcessCert: string;
  adminChangeStatus: string;
  adminChangeStatusMsg: string;
  adminNoteLabel: string;
  adminStatusUpdated: string;
  adminCannotUpdateStatus: string;
  adminSearchUserPlaceholder: string;
  adminBanPermanent: string;
  adminBanExpired: string;
  adminBanDaysLeft: string;
  adminUnbanBtn: string;
  adminWdFilterPending: string;
  adminWdFilterConfirmed: string;
  adminWdFilterRejected: string;
  noWithdrawals: string;
  adminRejectReasonPlaceholder: string;
  adminWdDetails: string;
  adminWdReturnNote: string;
  adminNoPendingProducts: string;
  adminAllApproved: string;
  adminProductDetails: string;
  adminAdditionalImages: string;
  adminCertStatusApproved: string;
  adminCertStatusRejected: string;
  adminCertStatusPending: string;
  adminHasCertificate: string;
  adminConfirmCertTitle: string;
  adminConfirmCertMsg: string;
  adminConfirmCertMsgShort: string;
  adminOptionalReasonPlaceholder: string;
  adminConfirmReject: string;
  adminRejectProduct: string;
  adminRejectProductReason: string;
  adminRelatedProduct: string;
  adminBanPermanentShort: string;
  adminBanExpiredShort: string;
  adminNoteOptional: string;
  adminBanReasonPlaceholder: string;
  adminConfirmBan: string;
  adminNoReports: string;
  adminNoReportsSub: string;
  adminNoUsers: string;
  adminNoUsersSub: string;
  adminJoinedLabel: string;
  adminBanReasonPrefix: string;
  adminWdAmountLabel: string;
  adminWdBankLabel: string;
  adminWdAccountLabel: string;
  adminWdDateLabel: string;
  adminUserInfoLabel: string;
  adminNameLabel: string;
  adminEmailLabel: string;
  adminPhoneLabel: string;
  adminAccountInfoLabel: string;
  adminAmountLabel: string;
  adminBankLabel: string;
  adminAccountNumberLabel: string;
  adminAccountHolderLabel: string;
  adminStatusLabel: string;
  adminWdDateRequested: string;
  adminWdRejectLabel: string;
  adminWdConfirmTransfer: string;
  adminCertLabel: string;
  adminCertApproveBtn: string;
  adminCertRejectBtn: string;
  adminCertRejectionReason: string;
  adminCategoryLabel: string;
  adminSubcategoryLabel: string;
  adminLocationLabel: string;
  adminSubmittedDate: string;
  adminAuctionStart: string;
  adminAuctionEnd: string;
  adminBidCount: string;
  adminCertLoadFailed: string;
  adminPdfNote: string;
  adminPdfOpenNote: string;
  adminOpenFile: string;
  adminCertRejectBtnLabel: string;
  adminReportedUserLabel: string;
  adminReportDescLabel: string;
  adminEvidenceLabel: string;
  adminTypeLabel: string;
  adminReportDateLabel: string;
  adminReportCodeLabel: string;
  adminTimelineLabel: string;
  adminReplyLabel: string;
  adminRepliedAtLabel: string;
  adminDisputeNote: string;
  adminContactInfoLabel: string;
  adminRoleLabel: string;
  adminStatsLabel: string;
  adminProductsLabel: string;
  adminOrdersLabel: string;
  adminReportsCountLabel: string;
  adminReportedByLabel: string;
  adminWalletLabel: string;
  adminBalanceLabel: string;
  adminBannedLabel: string;
  adminBanReasonLabel: string;
  adminBanUntilLabel: string;
  adminBanUserBtn: string;
  adminBanDurationLabel: string;
  emptyProductsShipping: string;

  // ─── My Bids (extended) ───
  bidAgain: string;
  increaseBid: string;
  invalidBidAmount: string;
  invalidBidAmountMsg: string;
  bidTooLowTitle: string;
  bidTooLowMsg: string;

  // ─── My Products (extended) ───
  confirmShipTitle: string;
  confirmShipMsg: string;
  shipSuccessMsg: string;
  shipFailedMsg: string;
  emptyProductsAll: string;
  emptyProductsCategory: string;
  shipProduct: string;
  shippedLabel: string;
  waitingBuyerLabel: string;
  priceCurrent: string;
  priceFinal: string;
  priceForSale: string;
  buyerConfirmedPleaseShip: string;
  shippedWaitingBuyerConfirm: string;
  waitingBuyerContact: string;

  // ─── Product Detail (extended) ───
  enterBidAmountErr: string;
  bidTooLowErr: string;
  confirmBidTitle: string;
  confirmBidMsg: string;
  bidPlacedMsg: string;
  confirmBuyNowTitle: string;
  buyNowActionBtn: string;
  buyNowSuccessMsg: string;
  buyNowFailedTitle: string;
  genericTryAgain: string;
  minBidLabel: string;
  bidMinRequired: string;

  // ─── Profile (extended) ───
  unknownUser: string;

  // ─── Wallet TX fallbacks ───
  bidPlacedTx: string;
  refundTx: string;
  saleEarningTx: string;
  transactionTx: string;

  // ─── Help & Support (extended) ───
  reportTypeScam: string;
  reportTypeFakeProduct: string;
  reportTypeHarassment: string;
  reportTypeInappropriate: string;
  reportTypeOther: string;
  maxEvidenceTitle: string;
  maxEvidenceMsg: string;
  errSelectReportType: string;
  errEnterReportedUser: string;
  errEnterReportDesc: string;
  reportSubmitFailed: string;
  reportReviewing: string;
  reportUnknown: string;
  faqSubtitle: string;
  reportResponseTime: string;
  reportSectionTitle: string;
  reportStatusTitle: string;
  reportStatusSub: string;
  reportedUserIdLabel: string;
  enterReportedUserId: string;
  reportProductIdLabel: string;
  enterReportedProductId: string;
  tapForDetails: string;
  reportDetailTitle: string;
  reportDescLabel: string;
  reportDescPlaceholder: string;

  // ─── Seller (extended) ───
  maxPhotosTitle: string;
  maxPhotosMsg: string;

  // ─── About (footer) ───
  needHelp: string;
  contactSupportDesc: string;

  // ─── TopUp (button labels) ───
  selectAmountAndMethod: string;
  confirmSubmitSlip: string;
  uploadSlipToContinue: string;
};

export const translations: Record<Language, TranslationKeys> = {
  en: {
    // Common
    viewAll: "View All →",
    loading: "Loading...",
    error: "Error",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    back: "Back",
    noData: "No data available",
    search: "Search",
    clear: "Clear",
    clearAll: "Clear All",
    filter: "Filter",
    refresh: "Refresh",
    retry: "Retry",
    close: "Close",
    submit: "Submit",
    delete: "Delete",
    edit: "Edit",
    send: "Send",
    ok: "OK",
    success: "Success",
    yes: "Yes",
    no: "No",
    language: "Language",

    // Welcome
    welcomeTagline: "Your Ultimate Auction Platform",
    welcomeDescription:
      "Discover unique items, place bids in real-time, and win amazing deals. Join thousands of happy bidders today!",
    activeUsers: "Active Users",
    productAuctions: "Product Auctions",
    loginSignup: "Log In / Sign Up",
    browseAsGuest: "Get Started Now",
    featureRealtimeBidding: "Real-Time Bidding",
    featureRealtimeBiddingDesc: "Place bids instantly and track live auctions",
    featureAlerts: "Instant Alerts",
    featureAlertsDesc: "Get notified when you are outbid",
    featureDeals: "Win Great Deals",
    featureDealsDesc: "Amazing products at competitive prices",

    // Auth Modal
    login: "Log In",
    loginTitle: "Welcome Back",
    register: "Register",
    registerTitle: "Create Account",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    sendToken: "Send Token",
    enterToken: "Enter Token",
    newPassword: "New Password",
    noAccount: "Don't have an account?",
    haveAccount: "Already have an account?",
    enterEmail: "Enter your email",
    enterPassword: "Enter your password",
    enterFullName: "Enter your full name",
    enterNewPassword: "Enter your new password (at least 6 characters)",
    reenterNewPassword: "Re-enter your new password",
    enterPhone: "Enter your phone number",
    enterConfirmPassword: "Re-enter your password",
    pdpaTitle: "Privacy Policy",
    pdpaAccept: "I accept the Privacy Policy",
    pdpaContinue: "Continue",

    // Tab Bar
    tabHome: "Home",
    tabWallet: "My Wallet",
    tabSeller: "Sell",
    tabBids: "My Bids",
    tabProfile: "Profile",

    // Home
    totalBalance: "Total Balance",
    searchPlaceholder: "Search products...",
    categories: "Categories",
    recommended: "Recommended For You",
    hotBids: "Hot Bids",
    endingSoon: "Ending Soon",
    allProducts: "All Products",
    incoming: "Incoming",
    noProducts: "No products listed yet",
    recentSearches: "Recent Searches",
    trending: "Trending",
    signInToBid: "Sign in to bid",
    noResults: "No results found",
    searchResults: "Search Results",
    result: "result",
    results: "results",
    timeBadgeEnding: "Ending",
    hotBadge: "🔥",
    endingBadge: "⏰",
    incomingBadge: "📦",
    minBid: "Min Bid",

    // Profile
    joined: "Joined",
    balance: "Balance",
    pending: "Pending",
    total: "Total",
    editProfile: "Edit Profile",
    verifyProduct: "Verify Product",
    myProducts: "My Products",
    helpSupport: "Help & Support",
    about: "About App",
    logout: "Log Out",
    logoutConfirmTitle: "Log Out",
    logoutConfirmMessage: "Are you sure you want to log out?",
    logoutConfirmYes: "Log Out",
    ratingLabel: "Rating",
    reviewsLabel: "Reviews",

    // Wallet
    walletTitle: "My Wallet",
    availableBalance: "Available",
    pendingBalance: "Pending",
    topUp: "Top Up",
    withdraw: "Withdraw",
    transactionHistory: "Transaction History",
    noTransactions: "No transactions yet",
    justNow: "just now",
    minAgo: "min ago",
    hoursAgo: "hours ago",
    daysAgo: "days ago",
    topUpSuccess: "Top-up successful",
    withdrawSuccess: "Withdrawal submitted",
    amount: "Amount",
    enterAmount: "Enter amount",
    minAmount: "Minimum",

    // My Bids
    myBids: "My Bids",
    activeBids: "Active Bids",
    bidHistory: "Bid History",
    allBids: "All Bids",
    winning: "Winning",
    outbid: "Outbid",
    totalBids: "Total Bids",
    won: "Won",
    lost: "Lost",
    wonLabel: "Won",
    lostLabel: "Lost",
    totalLabel: "Total",
    placeBid: "Place Bid",
    currentBid: "Current Bid",
    yourBid: "Your Bid",
    bidIncrement: "Min Increment",
    minimumBid: "Minimum Bid",
    bidPlaced: "Your bid has been placed!",
    bidFailed: "Failed to place bid. Please try again.",
    ended: "Ended",
    searchBids: "Search bids...",
    noBidsYet: "No active bids yet",
    noBidHistory: "No bid history",
    buyNow: "Buy Now",
    buyNowConfirm: "Buy Now",

    // Seller
    sellerTitle: "List a Product",
    listProduct: "List Product",
    productName: "Product Name",
    productDescription: "Description",
    startingPrice: "Starting Price",
    minBidIncrement: "Min Bid Increment",
    auctionDuration: "Auction Duration",
    selectCategory: "Select Category",
    selectSubcategory: "Select Subcategory",
    addImages: "Add Images",
    auctionStartTime: "Auction Start Time",
    submitProduct: "Submit for Review",
    productSubmitted: "Product submitted successfully!",
    province: "Province",
    contact: "Contact",

    // My Products
    myProductsTitle: "My Products",
    allStatus: "All",
    activeStatus: "Active",
    endedStatus: "Ended",
    shippingStatus: "Shipping",
    noProductsYet: "No products listed yet",

    // Verify Product
    verifyTitle: "Verify Product",
    confirmContact: "Confirm Contact",
    markReceived: "Mark as Received",
    reportIssue: "Report Issue",
    allTab: "All",
    wonTab: "🏆 Won",
    shippingTab: "📦 Shipping",
    doneTab: "✅ Done",
    expiredTab: "⛔ Expired",
    noProductsFound: "No products found",
    seller: "Seller",
    buyer: "Buyer",

    // Edit Profile
    editProfileTitle: "Edit Profile",
    saveChanges: "Save Changes",
    changePassword: "Change Password",
    changePhoto: "Change Photo",
    profileUpdated: "Profile updated successfully",
    tokenSentTo: "Token sent to",
    enterTokenEmail: "Enter the token sent to your email",
    resendToken: "Resend Token",

    // Help & Support
    helpTitle: "Help & Support",
    faqTab: "FAQ",
    reportTab: "Report",
    reportStatusTab: "My Reports",
    faqTitle: "Frequently Asked Questions",
    reportTitle: "Report an Issue",
    reportType: "Report Type",
    reportDescription: "Description",
    reportUser: "Report User",
    attachEvidence: "Attach Evidence",
    reportSubmitted: "Report submitted successfully",
    myReports: "My Reports",
    reportStatus: "Status",
    reportPending: "Pending",
    reportResolved: "Resolved",
    reportRejected: "Rejected",

    // Banned
    bannedTitle: "Account Suspended",
    bannedSubtitle: "You cannot use the app at this time",
    bannedReason: "Reason",
    bannedUntil: "Suspended Until",
    bannedHelp: "If you believe this is an error, please contact support",
    bannedUnknown: "Not specified",

    // Product Detail
    startingBid: "Starting Bid",
    currentBidLabel: "Current Bid",
    auctionEnds: "Auction Ends",
    bidNow: "Bid Now",
    details: "Details",
    description: "Description",
    condition: "Condition",
    location: "Location",
    contactSeller: "Contact Seller",
    aboutSeller: "About Seller",
    reviews: "Reviews",
    noReviews: "No reviews yet",

    // View All
    viewAllTitle: "View All",
    sortBy: "Sort by",
    noItemsFound: "No items found",

    // Category
    categoryTitle: "Category",
    subcategories: "Subcategories",
    searchInCategory: "Search in category...",

    // About App
    aboutTitle: "About App",
    aboutVersion: "BidKhong v1.0.0",
    aboutDescription: "Online auction platform",

    // Auth loading & misc
    rememberPassword: "Remember your password?",
    loggingIn: "Logging in...",
    creatingAccount: "Creating account...",
    sendingReset: "Sending...",
    resettingPwd: "Resetting...",
    pleaseWait: "Please wait...",
    resetToken: "Reset Token",
    newPasswordLabel: "New Password",

    // Edit Profile
    personalInfo: "Personal Information",
    resetPasswordSection: "Reset Password",
    sendTokenToEmail: "Sent Token to Email",
    resendIn: "Resend in",
    sentTokenToEmail: "Sent Token to Email",
    token: "Token",
    confirmNewPassword: "Confirm New Password",
    savingDots: "Saving...",
    sendingToken: "Sending token...",
    resettingPassword: "Resetting password...",
    profileUpdatedSuccess: "\u2705 Profile updated successfully",
    unsavedChanges: "Unsaved Changes",
    unsavedChangesMsg: "You have unsaved changes. Do you want to discard them?",
    stay: "Stay",
    discard: "Discard",
    tokenSentTitle: "Token Sent Successfully",
    tokenSentMsg:
      "We have sent a token to your email.\nPlease check your email and enter the token to reset your password.",
    errEnterFullName: "Please enter your full name",
    errEnterEmail: "Please enter your email",
    errValidEmail: "Please enter a valid email address",
    errEnterPhone: "Please enter your phone number",
    errEnterToken: "Please enter the token sent to your email",
    errEnterNewPwd: "Please enter your new password",
    errPwdLength: "New password must be at least 6 characters",
    errPwdNoMatch: "New passwords do not match",
    pwdChangedSuccess: "Password changed successfully",
    permissionRequired: "Permission Required",
    permissionPhotoMsg:
      "Please allow access to your photo library to upload a profile picture",
    profilePicUploaded: "Profile picture uploaded successfully",
    resetPwdInfo:
      "We will send a token to your email\nto use for resetting your password",

    // Seller
    sellerModeTitle: "Seller Mode",
    sellerModeSubtitle: "Preparing auction page...",
    createAuction: "Create Auction",
    productPhotos: "Product Photos * (Max 8)",
    cover: "Cover",
    firstPhotoCover: "First Photo will be the cover image",
    addPhoto: "Add Photo",
    productTitle: "Product Title *",
    category: "Category *",
    subcategory: "Subcategory *",
    descriptionStar: "Description *",
    locationStar: "Location *",
    pricing: "Pricing",
    startingBidStar: "Starting Bid *",
    bidIncrementStar: "Bid Increment *",
    buyoutPrice: "Buyout Price",
    buyoutPriceInfo: "Buyers can purchase immediately at this price",
    auctionStartDateTime: "Auction Start Date & Time *",
    auctionEndDateTime: "Auction End Date & Time *",
    auctionStartsSummary: "Auction starts:",
    auctionEndsSummary: "Auction ends:",
    at: "at",
    certificate: "Certificate of Authenticity",
    certOptional: "Optional",
    certInfo: "Upload a certificate to prove this product is authentic",
    uploadCertificate: "Upload Certificate",
    certHint: "JPG, PNG supported",
    change: "Change",
    remove: "Remove",
    cancelPicker: "Cancel",
    donePicker: "Done",
    startDate: "Start Date",
    startTime: "Start Time",
    selectDate: "Select Date",
    selectTime: "Select Time",
    creatingAuction: "Creating Auction",
    creatingAuctionSub: "Creating your auction...",
    auctionCreatedSuccess: "Auction Created!",
    auctionCreatedSub: "Redirecting to home...",
    auctionError: "An error occurred",
    reqTitle: "Please enter a product title.",
    reqCategorySub: "Please select a category and subcategory.",
    reqDescription: "Please enter a description.",
    reqStartingBid: "Please enter a starting bid price.",
    reqLocation: "Please select a location.",
    reqStartDateTime: "Please select auction start date and time.",
    reqEndDateTime: "Please select auction end date and time.",
    errInvalidTime: "Invalid auction time.",

    // Verify Product
    verifyProductTitle: "Verify Product",
    tabAll: "All",
    tabWon: "🏆 Won",
    tabShipping: "📦 Shipping",
    tabDone: "✅ Done",
    tabProblem: "⚠️ Problem",
    loadingOrders: "Loading orders...",
    noOrdersFound: "No orders found",
    noWonAuctions: "You haven't won any auctions yet",
    noOrdersInStatus: "No orders in this status",
    wonOn: "Won on",
    orderDetails: "Order Details",
    winningPrice: "Winning Price",
    orderProgress: "Order Progress",
    wonAuction: "Won Auction",
    receivedItem: "Received",
    sellerContact: "Seller Contact",
    confirmContactNote:
      "Please contact the seller to arrange shipping before confirming.",
    productReceived: "Product Received",
    completedTitle: "Completed!",
    completedSub: "Thank you for using BidKhong!",
    underDispute: "Under Dispute",
    waitingSellerShip: "Waiting for Seller to Ship",
    waitingDelivery: "Waiting for Delivery",
    waitingSellerShipDesc: "Please wait for the seller to ship your item.",
    waitingDeliveryDesc: "Your item is on its way.",
    verificationDeadlinePassed: "Verification Deadline Passed",
    timeRemainingToVerify: "Time Remaining to Verify",
    hrs: "hrs",
    min: "min",
    sec: "sec",
    statusWon: "Won",
    statusConfirmed: "Confirmed",
    statusShipped: "Shipped",
    statusCompleted: "Completed",
    statusDisputed: "Disputed",
    statusCancelled: "Cancelled",
    statusExpired: "Expired",
    statusUnknown: "Unknown",
    orderExpired: "Order Expired",
    orderCancelled: "Order Cancelled",
    orderExpiredSub:
      "The confirmation deadline has passed. This order has been voided.",
    orderCancelledSub: "This order has been cancelled.",
    reviewTitle: "Rate Seller",
    submitReview: "Submit Review",
    reviewCommentPlaceholder: "Share your experience with this seller...",
    rateSellerTitle: "Rate Seller",
    disputeTitle: "Report an Issue",
    disputeReasonPlaceholder: "Describe your issue...",
    uploadEvidence: "Upload Evidence",
    submitDispute: "Submit Dispute",

    // My Products
    tabIncoming: "Incoming",
    tabActive: "Active",
    tabEnded: "Ended",
    tabHot: "🔥 Hot",
    tagEnding: "Ending",
    tagActive: "Active",
    tagShipping: "Shipping",
    bids: "bids",

    // Help & Support
    helpSupportTitle: "Help & Support",
    tabFaq: "❓ FAQ",
    tabReport: "🚨 Report",
    tabStatus: "📋 Status",
    adminName: "Admin BidKhong",

    // Product Detail
    productNotFound: "Product not found",
    goBack: "Go Back",
    unknownSeller: "Unknown Seller",
    tagHot: "🔥 Hot",
    tagEndingSoon: "⏰ Ending Soon",
    tagIncoming: "🔜 Incoming",
    tagCertified: "✅ Certified",
    tagPendingCert: "🕐 Pending Certificate",
    upcomingAuction: "Upcoming Auction",
    auctionNotStarted: "This auction hasn't started yet. Starts in",
    buyoutPriceLabel: "Buyout Price",
    minimumIncrement: "Minimum bid increment: ฿",
    soldBoughtNow: "Sold — Bought Now",
    auctionEnded: "Auction Ended",
    auctionEndedSub: "This auction is no longer accepting bids.",
    placeYourBid: "Place Your Bid",
    bid: "Bid",
    auctionInformation: "Auction Information",
    starts: "Starts",
    ends: "Ends",
    startsIn: "Starts In",
    timeRemaining: "Time Remaining",
    mAgo: "m ago",
    hAgo: "h ago",
    dAgo: "d ago",

    // View All
    hotAuctions: "Hot Auctions",
    allProduct: "All Product",
    incomingAuctions: "Incoming",
    allAuctions: "All Auctions",
    searchIn: "Search in",
    aiPick: "AI Pick",
    tryAdjustSearch: "Try adjusting your search",

    // Category
    noSubcategoriesFound: "No Subcategories Found",
    noProductsInSub: "No products in",

    // History Filter Modal
    filterHistory: "Filter History",
    filterPeriodSubtitle: "Select period to view",
    yearLabel: "YEAR",
    monthLabel: "MONTH",
    allMonths: "All",
    selectedFilter: "Selected Filter",
    allYearPrefix: "All of",
    applyFilter: "Apply Filter",
    txTypeAll: "All",
    txTypeDeposit: "Top Up",
    txTypeWithdraw: "Withdraw",
    txTypeWon: "Won Auction",
    txTypeBid: "Bid Placed",
    txTypeRefund: "Refund",
    monthJan: "January",
    monthFeb: "February",
    monthMar: "March",
    monthApr: "April",
    monthMay: "May",
    monthJun: "June",
    monthJul: "July",
    monthAug: "August",
    monthSep: "September",
    monthOct: "October",
    monthNov: "November",
    monthDec: "December",
    monthJanS: "Jan",
    monthFebS: "Feb",
    monthMarS: "Mar",
    monthAprS: "Apr",
    monthMayS: "May",
    monthJunS: "Jun",
    monthJulS: "Jul",
    monthAugS: "Aug",
    monthSepS: "Sep",
    monthOctS: "Oct",
    monthNovS: "Nov",
    monthDecS: "Dec",

    // TopUp Modal
    topUpWallet: "Top Up Wallet",
    paymentDetails: "Payment Details",
    selectAmount: "Select Amount",
    enterCustomAmount: "Or Enter Custom Amount",
    paymentMethod: "Payment Method",
    scanQrToPay: "Scan QR Code to Pay",
    scanQrSub: "Scan the QR Code below",
    amountToPay: "Amount to pay",
    transferViaMobileBanking: "Transfer via Mobile Banking",
    transferViaMobileBankingSub: "Transfer to the account below",
    selectBankToTransfer: "Select Bank to Transfer",
    accountNameLabel: "Account Name",
    uploadPaymentSlip: "Upload Payment Slip",
    tapToUploadSlip: "Tap to Upload Slip",
    supportedFormats: "JPG, PNG supported",
    errEnterTopUpAmount: "Please select or enter an amount to top up",
    errUploadSlip: "Please upload a payment slip",
    slipSubmitFailed: "Failed to submit. Please try again.",

    // Withdraw Modal
    selectBank: "Select Bank",
    enterAmountMin100: "Or enter custom amount (Min ฿100)",
    promptPayNumberLabel: "Phone / National ID",
    bankAccountNumberLabel: "Bank Account Number",
    phoneNumberPlaceholder: "10-digit phone number",
    bankAccountPlaceholder: "Enter 10–15 digit account number",
    accountHolderName: "Account Holder Name",
    accountHolderPlaceholder: "Full name",
    errMinWithdraw: "Minimum withdrawal is ฿100",
    errPromptPayFormat: "Enter a 10-digit phone number or 13-digit national ID",
    errBankAccountFormat: "Enter a 10–15 digit account number",
    errAccountHolderName: "Please enter the account holder's name",
    processing: "Processing...",
    confirmWithdraw: "Confirm Withdrawal",
    withdrawPendingNote: "Please allow up to 24 hrs for processing.",
    genericRetryError: "An error occurred. Please try again.",

    // About App (extended)
    aboutStatUsers: "Users",
    aboutStatProducts: "Products",
    aboutStatSafe: "Secure",
    aboutHowToUse: "📖 How to Use BidKhong",
    aboutHowToUseSub: "Complete step-by-step guide",
    aboutFeatureTitle: "⭐ Key Features",
    aboutFaqSection: "❓ Frequently Asked Questions",
    aboutAppDesc:
      "Online auction platform with built-in Wallet, real-time bidding, and automatic product verification",

    // Admin
    adminReports: "Reports",
    adminUsers: "Users",
    adminAuctions: "Auctions",
    adminWithdrawals: "Withdrawals",
    approved: "Approved",
    rejected: "Rejected",
    approve: "Approve",
    reject: "Reject",
    reportDismissed: "Dismissed",
    days: "days",
    adminConfirmWithdrawTitle: "Confirm Withdrawal",
    adminConfirmWithdrawMsg:
      "Have you already transferred the money to the user?",
    adminWithdrawConfirmed: "Withdrawal confirmed successfully.",
    adminCannotConfirm: "Unable to confirm.",
    adminEnterReason: "Please Enter Reason",
    adminSpecifyRejectReason: "Please specify a reason for rejection.",
    adminWithdrawRejected:
      "Withdrawal rejected. Funds will be returned to wallet.",
    adminCannotReject: "Unable to reject.",
    adminEnterBanReason: "Please enter a ban reason.",
    adminEnterValidDays: "Please enter a valid number of days.",
    adminBanSuccess: "User {name} has been banned.",
    adminCannotBan: "Unable to ban user.",
    adminUnbanConfirmMsg: 'Unban user "{name}"?',
    adminUnbanSuccess: "{name} has been unbanned.",
    adminCannotUnban: "Unable to unban user.",
    adminEnterRejectReason: "Please enter a rejection reason.",
    adminProductRejected: "Product rejected successfully.",
    adminCannotRejectProduct: "Unable to reject product.",
    adminApproveProduct: "Approve Product",
    adminApproveConfirmMsg: 'Approve "{name}" for auction?',
    adminProductApproved: "Product approved successfully.",
    adminCannotApprove: "Unable to approve product.",
    adminCertApproved: "Certificate approved successfully.",
    adminCertRejected: "Certificate rejected successfully.",
    adminCannotProcessCert: "Unable to process certificate.",
    adminChangeStatus: "Change Status",
    adminChangeStatusMsg: 'Change status to "{status}"?',
    adminNoteLabel: "Note",
    adminStatusUpdated: "Status updated successfully.",
    adminCannotUpdateStatus: "Unable to update status.",
    adminSearchUserPlaceholder: "Search name or email...",
    adminBanPermanent: "Permanently Banned",
    adminBanExpired: "Ban Expired",
    adminBanDaysLeft: "{n} days left",
    adminUnbanBtn: "Unban",
    adminWdFilterPending: "⏳ Pending",
    adminWdFilterConfirmed: "✅ Approved",
    adminWdFilterRejected: "❌ Rejected",
    noWithdrawals: "No withdrawal requests",
    adminRejectReasonPlaceholder: "Enter rejection reason...",
    adminWdDetails: "Withdrawal Details",
    adminWdReturnNote: "Funds will be automatically returned to user's wallet.",
    adminNoPendingProducts: "No pending products",
    adminAllApproved: "All products have been reviewed.",
    adminProductDetails: "Product Details",
    adminAdditionalImages: "Additional Images",
    adminCertStatusApproved: "✅ Approved",
    adminCertStatusRejected: "❌ Rejected",
    adminCertStatusPending: "⏳ Pending review",
    adminHasCertificate: "Has Certificate",
    adminConfirmCertTitle: "Approve Certificate",
    adminConfirmCertMsg:
      "Confirm certificate approval? Product will receive Certified badge ✅",
    adminConfirmCertMsgShort: "Confirm certificate approval?",
    adminOptionalReasonPlaceholder: "Enter reason (optional)...",
    adminConfirmReject: "Confirm Reject",
    adminRejectProduct: "Reject Product",
    adminRejectProductReason: "Please specify a rejection reason for",
    adminRelatedProduct: "Related Product",
    adminBanPermanentShort: "Permanent",
    adminBanExpiredShort: "Expired",
    adminNoteOptional: "Admin note (optional)...",
    adminBanReasonPlaceholder: "Enter ban reason...",
    adminConfirmBan: "Confirm Ban",
    adminNoReports: "No Reports",
    adminNoReportsSub: "No users have submitted any reports.",
    adminNoUsers: "No Users",
    adminNoUsersSub: "No users in the system yet.",
    adminJoinedLabel: "Joined",
    adminBanReasonPrefix: "Reason",
    adminWdAmountLabel: "Amount",
    adminWdBankLabel: "Bank",
    adminWdAccountLabel: "Account No.",
    adminWdDateLabel: "Date",
    adminUserInfoLabel: "User Info",
    adminNameLabel: "Name",
    adminEmailLabel: "Email",
    adminPhoneLabel: "Phone",
    adminAccountInfoLabel: "Account Info",
    adminAmountLabel: "Amount",
    adminBankLabel: "Bank",
    adminAccountNumberLabel: "Account No.",
    adminAccountHolderLabel: "Account Name",
    adminStatusLabel: "Status",
    adminWdDateRequested: "Withdrawal Date",
    adminWdRejectLabel: "Specify Rejection Reason *",
    adminWdConfirmTransfer: "Confirm (Transferred)",
    adminCertLabel: "Certificate",
    adminCertApproveBtn: "Approve Cert",
    adminCertRejectBtn: "Reject Cert",
    adminCertRejectionReason: "Rejection Reason:",
    adminCategoryLabel: "Category",
    adminSubcategoryLabel: "Subcategory",
    adminLocationLabel: "Location",
    adminSubmittedDate: "Submit Date",
    adminAuctionStart: "Bid Start",
    adminAuctionEnd: "Bid End",
    adminBidCount: "Bids: {n}",
    adminCertLoadFailed: "Cannot load certificate",
    adminPdfNote: "This file is a PDF and cannot be displayed in the app",
    adminPdfOpenNote: "Tap the button below to open it",
    adminOpenFile: "Open File",
    adminCertRejectBtnLabel: "Reject Certificate",
    adminReportedUserLabel: "Reported User",
    adminReportDescLabel: "Issue Description",
    adminEvidenceLabel: "Evidence ({n} photos)",
    adminTypeLabel: "Type",
    adminReportDateLabel: "Report Date",
    adminReportCodeLabel: "Report Code",
    adminTimelineLabel: "Timeline",
    adminReplyLabel: "Admin Reply",
    adminRepliedAtLabel: "Replied on:",
    adminDisputeNote:
      "This report is from an order dispute, managed automatically through the order system.",
    adminContactInfoLabel: "Contact Info",
    adminRoleLabel: "Role",
    adminStatsLabel: "Statistics",
    adminProductsLabel: "Products",
    adminOrdersLabel: "Orders",
    adminReportsCountLabel: "Reports",
    adminReportedByLabel: "Reported",
    adminWalletLabel: "Wallet",
    adminBalanceLabel: "Balance",
    adminBannedLabel: "Suspended",
    adminBanReasonLabel: "Ban Reason",
    adminBanUntilLabel: "Banned until",
    adminBanUserBtn: "Ban User",
    adminBanDurationLabel: "Duration (days)",
    emptyProductsShipping: "No products awaiting buyer confirmation.",

    // My Bids (extended)
    bidAgain: "Bid Again",
    increaseBid: "Increase Bid",
    invalidBidAmount: "Invalid Amount",
    invalidBidAmountMsg: "Please enter a valid bid amount.",
    bidTooLowTitle: "Bid Too Low",
    bidTooLowMsg: "Your bid must be higher than the current bid.",

    // My Products (extended)
    confirmShipTitle: "Confirm Shipping",
    confirmShipMsg: "Have you already shipped the product to the buyer?",
    shipSuccessMsg: "Shipping confirmed successfully.",
    shipFailedMsg: "Could not confirm shipping. Please try again.",
    emptyProductsAll:
      "You have no products listed yet.\nTap the Sell tab to create an auction.",
    emptyProductsCategory: "No products in this status.",
    shipProduct: "📦 Ship Product",
    shippedLabel: "📦 Shipped",
    waitingBuyerLabel: "⏳ Waiting",
    priceCurrent: "Current Price",
    priceFinal: "Final Price",
    priceForSale: "Listing Price",
    buyerConfirmedPleaseShip: "✅ Buyer confirmed. Please ship now.",
    shippedWaitingBuyerConfirm: "📦 Shipped. Awaiting buyer confirmation.",
    waitingBuyerContact: "⏳ Waiting for buyer to confirm.",

    // Product Detail (extended)
    enterBidAmountErr: "Please enter a bid amount",
    bidTooLowErr: "Bid Too Low",
    confirmBidTitle: "Confirm Bid",
    confirmBidMsg: "Do you want to bid",
    bidPlacedMsg: "Your bid was placed successfully!",
    confirmBuyNowTitle: "Confirm Purchase",
    buyNowActionBtn: "Buy Now",
    buyNowSuccessMsg: "You have received this item.",
    buyNowFailedTitle: "Purchase Failed",
    genericTryAgain: "An error occurred. Please try again.",
    minBidLabel: "Minimum",
    bidMinRequired: "Minimum bid is",

    // Profile (extended)
    unknownUser: "Unknown User",

    // Wallet TX fallbacks
    bidPlacedTx: "Bid Placed",
    refundTx: "Refund",
    saleEarningTx: "Sale Earning",
    transactionTx: "Transaction",

    // Help & Support (extended)
    reportTypeScam: "🚨 Scam/Fraud",
    reportTypeFakeProduct: "📦 Fake Product",
    reportTypeHarassment: "😡 Harassment",
    reportTypeInappropriate: "⚠️ Inappropriate Content",
    reportTypeOther: "📝 Other",
    maxEvidenceTitle: "Limit Reached",
    maxEvidenceMsg: "You can attach up to 5 evidence photos.",
    errSelectReportType: "Please select a report type.",
    errEnterReportedUser: "Please enter the user ID to report.",
    errEnterReportDesc: "Please enter a description.",
    reportSubmitFailed: "Could not submit the report. Please try again.",
    reportReviewing: "Under Review",
    reportUnknown: "Unknown",
    faqSubtitle: "Tap a question to see the answer",
    reportResponseTime: "Our team will respond within 24–48 hours",
    reportSectionTitle: "Report / Feedback",
    reportStatusTitle: "Report Status",
    reportStatusSub: "Track your submitted reports",
    reportedUserIdLabel: "Reported User ID *",
    enterReportedUserId: "Enter user ID to report",
    reportProductIdLabel: "Product ID (optional)",
    enterReportedProductId: "Enter related product ID (optional)",
    tapForDetails: "Tap for details →",
    reportDetailTitle: "Report Details",
    reportDescLabel: "Description *",
    reportDescPlaceholder: "Describe the problem or reason for reporting...",

    // Seller (extended)
    maxPhotosTitle: "Maximum Photos",
    maxPhotosMsg: "You can upload up to 8 photos.",
    needHelp: "Need Help?",
    contactSupportDesc: "Contact our support team anytime 24 hours",
    selectAmountAndMethod: "Select Amount & Payment Method",
    confirmSubmitSlip: "Confirm & Submit Slip",
    uploadSlipToContinue: "Upload Slip to Continue",
  },
  th: {
    // Common
    viewAll: "ดูทั้งหมด →",
    loading: "กำลังโหลด...",
    error: "เกิดข้อผิดพลาด",
    cancel: "ยกเลิก",
    confirm: "ยืนยัน",
    save: "บันทึก",
    back: "ย้อนกลับ",
    noData: "ไม่มีข้อมูล",
    search: "ค้นหา",
    clear: "ล้าง",
    clearAll: "ล้างทั้งหมด",
    filter: "กรอง",
    refresh: "รีเฟรช",
    retry: "ลองใหม่",
    close: "ปิด",
    submit: "ส่ง",
    delete: "ลบ",
    edit: "แก้ไข",
    send: "ส่ง",
    ok: "ตกลง",
    success: "สำเร็จ",
    yes: "ใช่",
    no: "ไม่",
    language: "ภาษา",

    // Welcome
    welcomeTagline: "แพลตฟอร์มประมูลสินค้าที่ดีที่สุด",
    welcomeDescription:
      "ค้นพบสินค้าที่น่าสนใจ ร่วมประมูลแบบเรียลไทม์ และคว้าดีลสุดคุ้ม เข้าร่วมกับผู้ประมูลหลายพันคนวันนี้!",
    activeUsers: "ผู้ใช้งานทั้งหมด",
    productAuctions: "สินค้าประมูล",
    loginSignup: "เข้าสู่ระบบ / สมัครสมาชิก",
    browseAsGuest: "เริ่มต้นใช้งาน",
    featureRealtimeBidding: "ประมูลแบบเรียลไทม์",
    featureRealtimeBiddingDesc: "ประมูลได้ทันทีและติดตามการประมูลสด",
    featureAlerts: "แจ้งเตือนทันที",
    featureAlertsDesc: "รับการแจ้งเตือนเมื่อมีคนเสนอราคาสูงกว่าคุณ",
    featureDeals: "ได้ดีลสุดคุ้ม",
    featureDealsDesc: "สินค้าคุณภาพในราคาที่แข่งขันได้",

    // Auth Modal
    login: "เข้าสู่ระบบ",
    loginTitle: "ยินดีต้อนรับ",
    register: "สมัครสมาชิก",
    registerTitle: "สร้างบัญชีใหม่",
    email: "อีเมล",
    password: "รหัสผ่าน",
    confirmPassword: "ยืนยันรหัสผ่าน",
    fullName: "ชื่อ-นามสกุล",
    phoneNumber: "เบอร์โทรศัพท์",
    forgotPassword: "ลืมรหัสผ่าน?",
    resetPassword: "รีเซ็ตรหัสผ่าน",
    sendToken: "ส่งรหัส",
    enterToken: "กรอกรหัส",
    newPassword: "รหัสผ่านใหม่",
    noAccount: "ยังไม่มีบัญชี?",
    haveAccount: "มีบัญชีแล้ว?",
    enterEmail: "กรอกอีเมลของคุณ",
    enterPassword: "กรอกรหัสผ่านของคุณ",
    enterFullName: "กรอกชื่อ-นามสกุล",
    enterNewPassword: "กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)",
    reenterNewPassword: "ยืนยันรหัสผ่านใหม่",
    enterPhone: "กรอกเบอร์โทรศัพท์",
    enterConfirmPassword: "กรอกรหัสผ่านอีกครั้ง",
    pdpaTitle: "นโยบายความเป็นส่วนตัว",
    pdpaAccept: "ฉันยอมรับนโยบายความเป็นส่วนตัว",
    pdpaContinue: "ดำเนินการต่อ",

    // Tab Bar
    tabHome: "หน้าหลัก",
    tabWallet: "กระเป๋าเงิน",
    tabSeller: "ขายสินค้า",
    tabBids: "การประมูล",
    tabProfile: "โปรไฟล์",

    // Home
    totalBalance: "ยอดรวมทั้งหมด",
    searchPlaceholder: "ค้นหาสินค้า...",
    categories: "หมวดหมู่",
    recommended: "แนะนำสำหรับคุณ",
    hotBids: "ยอดนิยม",
    endingSoon: "ใกล้หมดเวลา",
    allProducts: "สินค้าทั้งหมด",
    incoming: "เร็วๆ นี้",
    noProducts: "ยังไม่มีสินค้า",
    recentSearches: "ค้นหาล่าสุด",
    trending: "กำลังนิยม",
    signInToBid: "เข้าสู่ระบบเพื่อประมูล",
    noResults: "ไม่พบผลลัพธ์",
    searchResults: "ผลการค้นหา",
    result: "รายการ",
    results: "รายการ",
    timeBadgeEnding: "ใกล้หมด",
    hotBadge: "🔥",
    endingBadge: "⏰",
    incomingBadge: "📦",
    minBid: "ราคาขั้นต่ำ",

    // Profile
    joined: "เป็นสมาชิกตั้งแต่",
    balance: "ยอดเงินคงเหลือ",
    pending: "รอดำเนินการ",
    total: "รวม",
    editProfile: "แก้ไขโปรไฟล์",
    verifyProduct: "ยืนยันสินค้า",
    myProducts: "สินค้าของฉัน",
    helpSupport: "ช่วยเหลือ & สนับสนุน",
    about: "เกี่ยวกับแอป",
    logout: "ออกจากระบบ",
    logoutConfirmTitle: "ออกจากระบบ",
    logoutConfirmMessage: "คุณแน่ใจที่ต้องการออกจากระบบหรือไม่?",
    logoutConfirmYes: "ออกจากระบบ",
    ratingLabel: "คะแนน",
    reviewsLabel: "รีวิว",

    // Wallet
    walletTitle: "กระเป๋าเงิน",
    availableBalance: "ใช้ได้",
    pendingBalance: "รอดำเนินการ",
    topUp: "เติมเงิน",
    withdraw: "ถอนเงิน",
    transactionHistory: "ประวัติธุรกรรม",
    noTransactions: "ยังไม่มีธุรกรรม",
    justNow: "เมื่อกี้",
    minAgo: "นาทีที่แล้ว",
    hoursAgo: "ชั่วโมงที่แล้ว",
    daysAgo: "วันที่แล้ว",
    topUpSuccess: "เติมเงินสำเร็จ",
    withdrawSuccess: "ส่งคำขอถอนเงินแล้ว",
    amount: "จำนวน",
    enterAmount: "กรอกจำนวนเงิน",
    minAmount: "ขั้นต่ำ",

    // My Bids
    myBids: "การประมูลของฉัน",
    activeBids: "กำลังประมูล",
    bidHistory: "ประวัติการประมูล",
    allBids: "ทั้งหมด",
    winning: "นำอยู่",
    outbid: "ถูกเสนอราคาสูงกว่า",
    totalBids: "ประมูลทั้งหมด",
    won: "ชนะ",
    lost: "แพ้",
    wonLabel: "ชนะ",
    lostLabel: "แพ้",
    totalLabel: "รวม",
    placeBid: "ประมูล",
    currentBid: "ราคาปัจจุบัน",
    yourBid: "ราคาของคุณ",
    bidIncrement: "เพิ่มขั้นต่ำ",
    minimumBid: "ราคาขั้นต่ำ",
    bidPlaced: "ประมูลสำเร็จแล้ว!",
    bidFailed: "ประมูลไม่สำเร็จ กรุณาลองใหม่",
    ended: "สิ้นสุดแล้ว",
    searchBids: "ค้นหาการประมูล...",
    noBidsYet: "ยังไม่มีการประมูลที่กำลังดำเนินอยู่",
    noBidHistory: "ยังไม่มีประวัติการประมูล",
    buyNow: "ซื้อเลย",
    buyNowConfirm: "ยืนยันการซื้อ",

    // Seller
    sellerTitle: "ลงประกาศสินค้า",
    listProduct: "ลงสินค้า",
    productName: "ชื่อสินค้า",
    productDescription: "รายละเอียด",
    startingPrice: "ราคาเริ่มต้น",
    minBidIncrement: "ราคาเพิ่มขั้นต่ำ",
    auctionDuration: "ระยะเวลาประมูล",
    selectCategory: "เลือกหมวดหมู่",
    selectSubcategory: "เลือกหมวดหมู่ย่อย",
    addImages: "เพิ่มรูปภาพ",
    auctionStartTime: "เวลาเริ่มประมูล",
    submitProduct: "ส่งให้ตรวจสอบ",
    productSubmitted: "ส่งสินค้าสำเร็จแล้ว!",
    province: "จังหวัด",
    contact: "ติดต่อ",

    // My Products
    myProductsTitle: "สินค้าของฉัน",
    allStatus: "ทั้งหมด",
    activeStatus: "กำลังประมูล",
    endedStatus: "สิ้นสุดแล้ว",
    shippingStatus: "กำลังจัดส่ง",
    noProductsYet: "ยังไม่มีสินค้าของคุณ",

    // Verify Product
    verifyTitle: "ยืนยันสินค้า",
    confirmContact: "ยืนยันการติดต่อ",
    markReceived: "ยืนยันรับสินค้าแล้ว",
    reportIssue: "แจ้งปัญหา",
    allTab: "ทั้งหมด",
    wonTab: "🏆 ชนะ",
    shippingTab: "📦 กำลังจัดส่ง",
    doneTab: "✅ เสร็จสิ้น",
    expiredTab: "⛔ หมดอายุ",
    noProductsFound: "ไม่พบสินค้า",
    seller: "ผู้ขาย",
    buyer: "ผู้ซื้อ",

    // Edit Profile
    editProfileTitle: "แก้ไขโปรไฟล์",
    saveChanges: "บันทึกการเปลี่ยนแปลง",
    changePassword: "เปลี่ยนรหัสผ่าน",
    changePhoto: "เปลี่ยนรูปภาพ",
    profileUpdated: "อัปเดตโปรไฟล์สำเร็จ",
    tokenSentTo: "ส่งรหัสไปยัง",
    enterTokenEmail: "กรอกรหัสที่ส่งไปยังอีเมลของคุณ",
    resendToken: "ส่งรหัสอีกครั้ง",

    // Help & Support
    helpTitle: "ช่วยเหลือ & สนับสนุน",
    faqTab: "คำถามที่พบบ่อย",
    reportTab: "แจ้งปัญหา",
    reportStatusTab: "การแจ้งปัญหาของฉัน",
    faqTitle: "คำถามที่พบบ่อย",
    reportTitle: "แจ้งปัญหา",
    reportType: "ประเภทปัญหา",
    reportDescription: "รายละเอียด",
    reportUser: "แจ้งผู้ใช้",
    attachEvidence: "แนบหลักฐาน",
    reportSubmitted: "ส่งเรื่องแจ้งปัญหาสำเร็จ",
    myReports: "การแจ้งปัญหาของฉัน",
    reportStatus: "สถานะ",
    reportPending: "รอดำเนินการ",
    reportResolved: "แก้ไขแล้ว",
    reportRejected: "ปฏิเสธ",

    // Banned
    bannedTitle: "บัญชีของคุณถูกระงับ",
    bannedSubtitle: "คุณไม่สามารถใช้งานแอปได้ในขณะนี้",
    bannedReason: "เหตุผล",
    bannedUntil: "ระงับจนถึง",
    bannedHelp: "หากคุณคิดว่านี่เป็นข้อผิดพลาด กรุณาติดต่อฝ่ายสนับสนุน",
    bannedUnknown: "ไม่ระบุ",

    // Product Detail
    startingBid: "ราคาเริ่มต้น",
    currentBidLabel: "ราคาปัจจุบัน",
    auctionEnds: "หมดเวลา",
    bidNow: "ประมูลเลย",
    details: "รายละเอียด",
    description: "คำอธิบาย",
    condition: "สภาพสินค้า",
    location: "ที่อยู่",
    contactSeller: "ติดต่อผู้ขาย",
    aboutSeller: "เกี่ยวกับผู้ขาย",
    reviews: "รีวิว",
    noReviews: "ยังไม่มีรีวิว",

    // View All
    viewAllTitle: "ดูทั้งหมด",
    sortBy: "เรียงตาม",
    noItemsFound: "ไม่พบสินค้า",

    // Category
    categoryTitle: "หมวดหมู่",
    subcategories: "หมวดหมู่ย่อย",
    searchInCategory: "ค้นหาในหมวดหมู่...",

    // About App
    aboutTitle: "เกี่ยวกับแอป",
    aboutVersion: "BidKhong v1.0.0",
    aboutDescription: "แพลตฟอร์มประมูลสินค้าออนไลน์",

    // Auth loading & misc
    rememberPassword: "จำรหัสผ่านได้?",
    loggingIn: "กำลังเข้าสู่ระบบ...",
    creatingAccount: "กำลังสร้างบัญชี...",
    sendingReset: "กำลังส่ง...",
    resettingPwd: "กำลังรีเซ็ต...",
    pleaseWait: "กรุณารอสักครู่...",
    resetToken: "รหัสรีเซ็ต",
    newPasswordLabel: "รหัสผ่านใหม่",

    // Edit Profile
    personalInfo: "ข้อมูลส่วนตัว",
    resetPasswordSection: "รีเซ็ตรหัสผ่าน",
    sendTokenToEmail: "ส่งรหัสไปยังอีเมล",
    resendIn: "ส่งอีกครั้งใน",
    sentTokenToEmail: "ส่งรหัสไปยังอีเมล",
    token: "รหัสยืนยัน",
    confirmNewPassword: "ยืนยันรหัสผ่านใหม่",
    savingDots: "กำลังบันทึก...",
    sendingToken: "กำลังส่งรหัส...",
    resettingPassword: "กำลังรีเซ็ตรหัสผ่าน...",
    profileUpdatedSuccess: "\u2705 อัปเดตโปรไฟล์สำเร็จแล้ว",
    unsavedChanges: "ยังไม่ได้บันทึก",
    unsavedChangesMsg:
      "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการยกเลิกหรือไม่?",
    stay: "อยู่ต่อ",
    discard: "ยกเลิก",
    tokenSentTitle: "ส่งรหัสสำเร็จ",
    tokenSentMsg:
      "เราได้ส่งรหัสไปยังอีเมลของคุณ\nกรุณาตรวจสอบอีเมลและกรอกรหัสเพื่อรีเซ็ตรหัสผ่าน",
    errEnterFullName: "กรุณากรอกชื่อของคุณ",
    errEnterEmail: "กรุณากรอกอีเมล",
    errValidEmail: "กรุณากรอกอีเมลที่ถูกต้อง",
    errEnterPhone: "กรุณากรอกเบอร์โทรศัพท์",
    errEnterToken: "กรุณากรอกรหัสที่ส่งไปยังอีเมล",
    errEnterNewPwd: "กรุณากรอกรหัสผ่านใหม่",
    errPwdLength: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร",
    errPwdNoMatch: "รหัสผ่านใหม่ไม่ตรงกัน",
    pwdChangedSuccess: "เปลี่ยนรหัสผ่านสำเร็จแล้ว",
    permissionRequired: "จำเป็นต้องอนุญาต",
    permissionPhotoMsg:
      "กรุณาอนุญาตให้เข้าถึงอัลบั้มรูปภาพเพื่ออัปโหลดรูปโปรไฟล์",
    profilePicUploaded: "อัปโหลดรูปโปรไฟล์สำเร็จ",
    resetPwdInfo: "เราจะส่งรหัสไปยังอีเมลของคุณ\nเพื่อใช้รีเซ็ตรหัสผ่าน",

    // Seller
    sellerModeTitle: "โหมดผู้ขาย",
    sellerModeSubtitle: "กำลังเตรียมหน้าสร้างประมูล...",
    createAuction: "สร้างการประมูล",
    productPhotos: "รูปสินค้า * (สูงสุด 8 รูป)",
    cover: "ปก",
    firstPhotoCover: "รูปแรกจะเป็นภาพปก",
    addPhoto: "เพิ่มรูป",
    productTitle: "ชื่อสินค้า *",
    category: "หมวดหมู่ *",
    subcategory: "หมวดหมู่ย่อย *",
    descriptionStar: "คำอธิบาย *",
    locationStar: "สถานที่ *",
    pricing: "ราคา",
    startingBidStar: "ราคาเปิด *",
    bidIncrementStar: "ขั้นต่ำการเพิ่มราคา *",
    buyoutPrice: "ราคาซื้อทันที",
    buyoutPriceInfo: "ผู้ซื้อสามารถซื้อสินค้าทันทีในราคานี้",
    auctionStartDateTime: "วันและเวลาเปิดประมูล *",
    auctionEndDateTime: "วันและเวลาสิ้นสุดประมูล *",
    auctionStartsSummary: "ประมูลเปิด:",
    auctionEndsSummary: "ประมูลสิ้นสุด:",
    at: "เวลา",
    certificate: "ใบรับรองความแท้",
    certOptional: "ไม่บังคับ",
    certInfo: "อัปโหลดใบรับรองเพื่อยืนยันความแท้ของสินค้า",
    uploadCertificate: "อัปโหลดใบรับรอง",
    certHint: "รองรับ JPG, PNG",
    change: "เปลี่ยน",
    remove: "ลบออก",
    cancelPicker: "ยกเลิก",
    donePicker: "ตกลง",
    startDate: "วันเริ่ม",
    startTime: "เวลาเริ่ม",
    selectDate: "เลือกวัน",
    selectTime: "เลือกเวลา",
    creatingAuction: "กำลังสร้างการประมูล",
    creatingAuctionSub: "กำลังสร้างการประมูลของคุณ...",
    auctionCreatedSuccess: "สร้างประมูลสำเร็จ!",
    auctionCreatedSub: "กำลังพาคุณกลับหน้าหลัก...",
    auctionError: "เกิดข้อผิดพลาด",
    reqTitle: "กรุณากรอกชื่อสินค้า",
    reqCategorySub: "กรุณาเลือกหมวดหมู่และหมวดหมู่ย่อย",
    reqDescription: "กรุณากรอกคำอธิบาย",
    reqStartingBid: "กรุณากรอกราคาเปิดประมูล",
    reqLocation: "กรุณาเลือกสถานที่",
    reqStartDateTime: "กรุณาเลือกวันและเวลาเปิดประมูล",
    reqEndDateTime: "กรุนาเลือกวันและเวลาสิ้นสุดประมูล",
    errInvalidTime: "เวลาประมูลไม่ถูกต้อง",

    // Verify Product
    verifyProductTitle: "ยืนยันสินค้า",
    tabAll: "ทั้งหมด",
    tabWon: "🏆 ชนะ",
    tabShipping: "📦 จัดส่ง",
    tabDone: "✅ เสร็จ",
    tabProblem: "⚠️ ปัญหา",
    loadingOrders: "กำลังโหลด...",
    noOrdersFound: "ไม่พบคำสั่งซื้อ",
    noWonAuctions: "คุณยังไม่เคยชนะการประมูล",
    noOrdersInStatus: "ไม่มีคำสั่งซื้อในสถานะนี้",
    wonOn: "ชนะเมื่อ",
    orderDetails: "รายละเอียดคำสั่งซื้อ",
    winningPrice: "ราคาที่ชนะ",
    orderProgress: "ความคืบหน้า",
    wonAuction: "ชนะประมูล",
    receivedItem: "ได้รับสินค้า",
    sellerContact: "ข้อมูลผู้ขาย",
    confirmContactNote: "กรุณาติดต่อผู้ขายเพื่อนัดหมายการจัดส่งก่อนยืนยัน",
    productReceived: "ได้รับสินค้าแล้ว",
    completedTitle: "เสร็จสมบูรณ์!",
    completedSub: "ขอบคุณที่ใช้บริการ BidKhong!",
    underDispute: "อยู่ระหว่างการพิจารณา",
    waitingSellerShip: "รอผู้ขายจัดส่ง",
    waitingDelivery: "รอรับสินค้า",
    waitingSellerShipDesc: "กรุณารอให้ผู้ขายจัดส่งสินค้า",
    waitingDeliveryDesc: "สินค้ากำลังอยู่ในระหว่างการจัดส่ง",
    verificationDeadlinePassed: "หมดเวลายืนยันสินค้าแล้ว",
    timeRemainingToVerify: "เวลาคงเหลือในการยืนยัน",
    hrs: "ชม.",
    min: "นาที",
    sec: "วิ",
    statusWon: "ชนะ",
    statusConfirmed: "ยืนยันแล้ว",
    statusShipped: "จัดส่งแล้ว",
    statusCompleted: "เสร็จสมบูรณ์",
    statusDisputed: "มีข้อพิพาท",
    statusCancelled: "ยกเลิก",
    statusExpired: "หมดอายุ",
    statusUnknown: "ไม่ทราบ",
    orderExpired: "คำสั่งซื้อหมดอายุ",
    orderCancelled: "คำสั่งซื้อถูกยกเลิก",
    orderExpiredSub: "หมดเวลายืนยัน คำสั่งซื้อนี้ถูกยกเลิกแล้ว",
    orderCancelledSub: "คำสั่งซื้อนี้ถูกยกเลิกแล้ว",
    reviewTitle: "รีวิวผู้ขาย",
    submitReview: "ส่งรีวิว",
    reviewCommentPlaceholder: "แชร์ประสบการณ์ของคุณกับผู้ขายรายนี้...",
    rateSellerTitle: "ให้คะแนนผู้ขาย",
    disputeTitle: "แจ้งปัญหา",
    disputeReasonPlaceholder: "อธิบายปัญหาของคุณ...",
    uploadEvidence: "อัปโหลดหลักฐาน",
    submitDispute: "ส่งเรื่องร้องเรียน",

    // My Products
    tabIncoming: "กำลังมา",
    tabActive: "กำลังประมูล",
    tabEnded: "สิ้นสุด",
    tabHot: "🔥 ยอดนิยม",
    tagEnding: "ใกล้สิ้นสุด",
    tagActive: "กำลังประมูล",
    tagShipping: "จัดส่ง",
    bids: "การประมูล",

    // Help & Support
    helpSupportTitle: "ช่วยเหลือ & สนับสนุน",
    tabFaq: "❓ คำถามพบบ่อย",
    tabReport: "🚨 รายงาน",
    tabStatus: "📋 สถานะ",
    adminName: "แอดมิน BidKhong",

    // Product Detail
    productNotFound: "ไม่พบสินค้า",
    goBack: "กลับหน้าก่อน",
    unknownSeller: "ไม่ทราบผู้ขาย",
    tagHot: "🔥 ยอดนิยม",
    tagEndingSoon: "⏰ ใกล้สิ้นสุด",
    tagIncoming: "🔜 กำลังมา",
    tagCertified: "✅ ผ่านการรับรอง",
    tagPendingCert: "🕐 รอการรับรอง",
    upcomingAuction: "การประมูลที่กำลังจะมาถึง",
    auctionNotStarted: "การประมูลยังไม่เริ่ม เริ่มใน",
    buyoutPriceLabel: "ราคาซื้อทันที",
    minimumIncrement: "ขั้นต่ำการเพิ่มราคา: ฿",
    soldBoughtNow: "ขายแล้ว — ซื้อทันที",
    auctionEnded: "การประมูลสิ้นสุดแล้ว",
    auctionEndedSub: "การประมูลนี้ไม่รับราคาเสนออีกต่อไป",
    placeYourBid: "วางราคาเสนอ",
    bid: "เสนอราคา",
    auctionInformation: "ข้อมูลการประมูล",
    starts: "เริ่ม",
    ends: "สิ้นสุด",
    startsIn: "เริ่มใน",
    timeRemaining: "เวลาคงเหลือ",
    mAgo: "นาทีที่แล้ว",
    hAgo: "ชั่วโมงที่แล้ว",
    dAgo: "วันที่แล้ว",

    // View All
    hotAuctions: "ร้อนแรง",
    allProduct: "สินค้าทั้งหมด",
    incomingAuctions: "กำลังมา",
    allAuctions: "ประมูลทั้งหมด",
    searchIn: "ค้นหาใน",
    aiPick: "AI เลือก",
    tryAdjustSearch: "ลองปรับการค้นหาดู",

    // Category
    noSubcategoriesFound: "ไม่พบหมวดหมู่ย่อย",
    noProductsInSub: "ยังไม่มีสินค้าใน",

    // History Filter Modal
    filterHistory: "กรองประวัติ",
    filterPeriodSubtitle: "เลือกช่วงเวลาที่ต้องการดู",
    yearLabel: "ปี",
    monthLabel: "เดือน",
    allMonths: "ทั้งหมด",
    selectedFilter: "ตัวกรองที่เลือก",
    allYearPrefix: "ทั้งปี",
    applyFilter: "ใช้ตัวกรอง",
    txTypeAll: "ทั้งหมด",
    txTypeDeposit: "เติมเงิน",
    txTypeWithdraw: "ถอนเงิน",
    txTypeWon: "ชนะประมูล",
    txTypeBid: "วางเดิมพัน",
    txTypeRefund: "คืนเงิน",
    monthJan: "มกราคม",
    monthFeb: "กุมภาพันธ์",
    monthMar: "มีนาคม",
    monthApr: "เมษายน",
    monthMay: "พฤษภาคม",
    monthJun: "มิถุนายน",
    monthJul: "กรกฎาคม",
    monthAug: "สิงหาคม",
    monthSep: "กันยายน",
    monthOct: "ตุลาคม",
    monthNov: "พฤศจิกายน",
    monthDec: "ธันวาคม",
    monthJanS: "ม.ค.",
    monthFebS: "ก.พ.",
    monthMarS: "มี.ค.",
    monthAprS: "เม.ย.",
    monthMayS: "พ.ค.",
    monthJunS: "มิ.ย.",
    monthJulS: "ก.ค.",
    monthAugS: "ส.ค.",
    monthSepS: "ก.ย.",
    monthOctS: "ต.ค.",
    monthNovS: "พ.ย.",
    monthDecS: "ธ.ค.",

    // TopUp Modal
    topUpWallet: "เติมเงินเข้ากระเป๋า",
    paymentDetails: "รายละเอียดการชำระเงิน",
    selectAmount: "เลือกจำนวนเงิน",
    enterCustomAmount: "หรือกรอกจำนวนเงิน",
    paymentMethod: "ช่องทางชำระเงิน",
    scanQrToPay: "สแกน QR Code เพื่อชำระเงิน",
    scanQrSub: "สแกน QR Code ด้านล่างเพื่อชำระเงิน",
    amountToPay: "จำนวนที่ต้องชำระ",
    transferViaMobileBanking: "โอนผ่าน Mobile Banking",
    transferViaMobileBankingSub:
      "โอนเงินผ่าน Mobile Banking ไปยังบัญชีด้านล่าง",
    selectBankToTransfer: "เลือกช่องทางโอนเงิน",
    accountNameLabel: "ชื่อบัญชี",
    uploadPaymentSlip: "อัปโหลดสลิปการชำระเงิน",
    tapToUploadSlip: "แตะเพื่ออัปโหลดสลิป",
    supportedFormats: "รองรับไฟล์ JPG, PNG",
    errEnterTopUpAmount: "กรุณาเลือกหรือกรอกจำนวนเงินที่ต้องการเติม",
    errUploadSlip: "กรุณาอัปโหลดสลิปการโอนเงิน",
    slipSubmitFailed: "ไม่สามารถส่งสลิปได้ กรุณาลองใหม่อีกครั้ง",

    // Withdraw Modal
    selectBank: "เลือกธนาคาร",
    enterAmountMin100: "หรือกรอกจำนวนเงิน (ขั้นต่ำ ฿100)",
    promptPayNumberLabel: "หมายเลขโทรศัพท์ / เลขบัตรประชาชน",
    bankAccountNumberLabel: "เลขบัญชีธนาคาร",
    phoneNumberPlaceholder: "หมายเลขโทรศัพท์ 10 หลัก",
    bankAccountPlaceholder: "กรอกเลขบัญชี 10–15 หลัก",
    accountHolderName: "ชื่อเจ้าของบัญชี",
    accountHolderPlaceholder: "ชื่อ-นามสกุล",
    errMinWithdraw: "จำนวนเงินขั้นต่ำ ฿100",
    errPromptPayFormat:
      "กรุณากรอกหมายเลขโทรศัพท์ (10 หลัก) หรือเลขบัตรประชาชน (13 หลัก)",
    errBankAccountFormat: "กรุณากรอกเลขบัญชี 10–15 หลัก",
    errAccountHolderName: "กรุณากรอกชื่อเจ้าของบัญชี",
    processing: "กำลังดำเนินการ...",
    confirmWithdraw: "ยืนยันการถอน",
    withdrawPendingNote: "โปรดรอตรวจสอบการถอนเงินภายใน 24 ชม.",
    genericRetryError: "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",

    // About App (extended)
    aboutStatUsers: "ผู้ใช้งาน",
    aboutStatProducts: "สินค้า",
    aboutStatSafe: "ปลอดภัย",
    aboutHowToUse: "📖 วิธีใช้งาน BidKhong",
    aboutHowToUseSub: "ขั้นตอนการใช้งานทั้งหมด",
    aboutFeatureTitle: "⭐ ฟีเจอร์เด่น",
    aboutFaqSection: "❓ คำถามที่พบบ่อย (FAQ)",
    aboutAppDesc:
      "แพลตฟอร์มประมูลสินค้าออนไลน์ที่ให้คุณซื้อขายสินค้าได้ง่าย สะดวก ปลอดภัย พร้อมระบบ Wallet และการยืนยันสินค้าอัตโนมัติ",

    // Admin
    adminReports: "รายงาน",
    adminUsers: "ผู้ใช้งาน",
    adminAuctions: "ประมูล",
    adminWithdrawals: "ถอนเงิน",
    approved: "อนุมัติแล้ว",
    rejected: "ปฏิเสธ",
    approve: "อนุมัติ",
    reject: "ปฏิเสธ",
    reportDismissed: "ยกเลิก",
    days: "วัน",
    adminConfirmWithdrawTitle: "ยืนยันการถอนเงิน",
    adminConfirmWithdrawMsg: "คุณได้โอนเงินให้ผู้ใช้แล้วใช่หรือไม่?",
    adminWithdrawConfirmed: "ยืนยันการถอนเงินเรียบร้อยแล้ว",
    adminCannotConfirm: "ไม่สามารถยืนยันได้",
    adminEnterReason: "กรุณากรอกเหตุผล",
    adminSpecifyRejectReason: "กรุณาระบุเหตุผลในการปฏิเสธ",
    adminWithdrawRejected: "ปฏิเสธการถอนเงินเรียบร้อย เงินจะถูกคืนกลับ wallet",
    adminCannotReject: "ไม่สามารถปฏิเสธได้",
    adminEnterBanReason: "กรุณากรอกเหตุผลในการแบน",
    adminEnterValidDays: "กรุณากรอกจำนวนวันที่ถูกต้อง",
    adminBanSuccess: "แบนผู้ใช้ {name} เรียบร้อยแล้ว",
    adminCannotBan: "ไม่สามารถแบนผู้ใช้ได้",
    adminUnbanConfirmMsg: 'ปลดแบนผู้ใช้ "{name}"?',
    adminUnbanSuccess: "ปลดแบนผู้ใช้ {name} เรียบร้อยแล้ว",
    adminCannotUnban: "ไม่สามารถปลดแบนผู้ใช้ได้",
    adminEnterRejectReason: "กรุณากรอกเหตุผลในการปฏิเสธ",
    adminProductRejected: "ปฏิเสธสินค้าเรียบร้อยแล้ว",
    adminCannotRejectProduct: "ไม่สามารถปฏิเสธสินค้าได้",
    adminApproveProduct: "อนุมัติสินค้า",
    adminApproveConfirmMsg: 'อนุมัติ "{name}" ให้เข้าสู่ระบบประมูล?',
    adminProductApproved: "อนุมัติสินค้าเรียบร้อยแล้ว",
    adminCannotApprove: "ไม่สามารถอนุมัติสินค้าได้",
    adminCertApproved: "อนุมัติใบรับรองเรียบร้อยแล้ว",
    adminCertRejected: "ปฏิเสธใบรับรองเรียบร้อยแล้ว",
    adminCannotProcessCert: "ไม่สามารถดำเนินการใบรับรองได้",
    adminChangeStatus: "เปลี่ยนสถานะ",
    adminChangeStatusMsg: 'เปลี่ยนสถานะเป็น "{status}"?',
    adminNoteLabel: "หมายเหตุ",
    adminStatusUpdated: "อัปเดตสถานะเรียบร้อยแล้ว",
    adminCannotUpdateStatus: "ไม่สามารถอัปเดตสถานะได้",
    adminSearchUserPlaceholder: "ค้นหาชื่อหรืออีเมล...",
    adminBanPermanent: "แบนถาวร",
    adminBanExpired: "หมดอายุแบนแล้ว",
    adminBanDaysLeft: "เหลือ {n} วัน",
    adminUnbanBtn: "ปลดแบน",
    adminWdFilterPending: "⏳ รอดำเนินการ",
    adminWdFilterConfirmed: "✅ อนุมัติแล้ว",
    adminWdFilterRejected: "❌ ปฏิเสธ",
    noWithdrawals: "ไม่มีรายการถอนเงิน",
    adminRejectReasonPlaceholder: "กรุณาระบุเหตุผล...",
    adminWdDetails: "รายละเอียดการถอนเงิน",
    adminWdReturnNote: "เงินจะถูกคืนกลับ wallet ของผู้ใช้โดยอัตโนมัติ",
    adminNoPendingProducts: "ไม่มีสินค้ารออนุมัติ",
    adminAllApproved: "สินค้าทั้งหมดได้รับการตรวจสอบแล้ว",
    adminProductDetails: "รายละเอียดสินค้า",
    adminAdditionalImages: "รูปภาพเพิ่มเติม",
    adminCertStatusApproved: "✅ อนุมัติแล้ว",
    adminCertStatusRejected: "❌ ปฏิเสธแล้ว",
    adminCertStatusPending: "⏳ รอตรวจสอบ",
    adminHasCertificate: "มีใบรับรองแนบ",
    adminConfirmCertTitle: "อนุมัติใบรับรอง",
    adminConfirmCertMsg:
      "ยืนยันอนุมัติใบรับรองนี้? สินค้าจะได้รับ badge Certified ✅",
    adminConfirmCertMsgShort: "ยืนยันอนุมัติใบรับรองนี้?",
    adminOptionalReasonPlaceholder: "ระบุเหตุผล (ไม่จำเป็น)...",
    adminConfirmReject: "ยืนยันปฏิเสธ",
    adminRejectProduct: "ปฏิเสธสินค้า",
    adminRejectProductReason: "กรุณาระบุเหตุผลในการปฏิเสธสินค้า",
    adminRelatedProduct: "สินค้าที่เกี่ยวข้อง",
    adminBanPermanentShort: "ถาวร",
    adminBanExpiredShort: "หมดอายุ",
    adminNoteOptional: "หมายเหตุจากแอดมิน (ไม่บังคับ)...",
    adminBanReasonPlaceholder: "กรอกเหตุผลในการแบน...",
    adminConfirmBan: "ยืนยันแบน",
    adminNoReports: "ไม่มีรายงานปัญหา",
    adminNoReportsSub: "ยังไม่มีผู้ใช้แจ้งปัญหาเข้ามา",
    adminNoUsers: "ไม่มีผู้ใช้",
    adminNoUsersSub: "ยังไม่มีผู้ใช้ในระบบ",
    adminJoinedLabel: "สมัครเมื่อ",
    adminBanReasonPrefix: "เหตุผล",
    adminWdAmountLabel: "จำนวน",
    adminWdBankLabel: "ธนาคาร",
    adminWdAccountLabel: "เลขบัญชี",
    adminWdDateLabel: "วันที่",
    adminUserInfoLabel: "ข้อมูลผู้ใช้",
    adminNameLabel: "ชื่อ",
    adminEmailLabel: "อีเมล",
    adminPhoneLabel: "โทรศัพท์",
    adminAccountInfoLabel: "ข้อมูลบัญชี",
    adminAmountLabel: "จำนวนเงิน",
    adminBankLabel: "ธนาคาร",
    adminAccountNumberLabel: "เลขบัญชี",
    adminAccountHolderLabel: "ชื่อบัญชี",
    adminStatusLabel: "สถานะ",
    adminWdDateRequested: "วันที่ขอถอน",
    adminWdRejectLabel: "ระบุเหตุผลในการปฏิเสธ *",
    adminWdConfirmTransfer: "ยืนยัน (โอนแล้ว)",
    adminCertLabel: "ใบรับรอง",
    adminCertApproveBtn: "อนุมัติ Cert",
    adminCertRejectBtn: "ปฏิเสธ Cert",
    adminCertRejectionReason: "เหตุผลที่ปฏิเสธ:",
    adminCategoryLabel: "หมวดหมู่",
    adminSubcategoryLabel: "หมวดย่อย",
    adminLocationLabel: "ที่ตั้ง",
    adminSubmittedDate: "วันที่ส่ง",
    adminAuctionStart: "เริ่มประมูล",
    adminAuctionEnd: "สิ้นสุดประมูล",
    adminBidCount: "จำนวนการเสนอราคา: {n}",
    adminCertLoadFailed: "ไม่สามารถโหลดใบรับรองได้",
    adminPdfNote: "ไฟล์นี้เป็น PDF ไม่สามารถแสดงในแอปได้",
    adminPdfOpenNote: "กดปุ่มด้านล่างเพื่อเปิดดู",
    adminOpenFile: "เปิดไฟล์",
    adminCertRejectBtnLabel: "ปฏิเสธใบรับรอง",
    adminReportedUserLabel: "ผู้ถูกรายงาน",
    adminReportDescLabel: "รายละเอียดปัญหา",
    adminEvidenceLabel: "หลักฐาน ({n} รูป)",
    adminTypeLabel: "ประเภท",
    adminReportDateLabel: "วันที่แจ้ง",
    adminReportCodeLabel: "รหัสรายงาน",
    adminTimelineLabel: "ไทม์ไลน์",
    adminReplyLabel: "ข้อความตอบกลับจากแอดมิน",
    adminRepliedAtLabel: "ตอบเมื่อ:",
    adminDisputeNote:
      "รายงานนี้มาจาก dispute คำสั่งซื้อ สถานะจัดการผ่านระบบ order โดยอัตโนมัติ",
    adminContactInfoLabel: "ข้อมูลติดต่อ",
    adminRoleLabel: "บทบาท",
    adminStatsLabel: "สถิติ",
    adminProductsLabel: "สินค้า",
    adminOrdersLabel: "ออเดอร์",
    adminReportsCountLabel: "รายงาน",
    adminReportedByLabel: "ถูกรายงาน",
    adminWalletLabel: "กระเป๋าเงิน",
    adminBalanceLabel: "ยอดคงเหลือ",
    adminBannedLabel: "ถูกระงับการใช้งาน",
    adminBanReasonLabel: "เหตุผลในการแบน",
    adminBanUntilLabel: "แบนถึงวันที่",
    adminBanUserBtn: "แบนผู้ใช้",
    adminBanDurationLabel: "จำนวนวัน",
    emptyProductsShipping: "ไม่มีสินค้าที่รอการยืนยันจากผู้ซื้อ",

    // My Bids (extended)
    bidAgain: "ประมูลอีกครั้ง",
    increaseBid: "เพิ่มราคาประมูล",
    invalidBidAmount: "จำนวนไม่ถูกต้อง",
    invalidBidAmountMsg: "กรุณากรอกจำนวนเงินที่ถูกต้อง",
    bidTooLowTitle: "ราคาต่ำเกินไป",
    bidTooLowMsg: "ราคาที่เสนอต้องสูงกว่าราคาปัจจุบัน",

    // My Products (extended)
    confirmShipTitle: "ยืนยันการจัดส่ง",
    confirmShipMsg: "คุณได้จัดส่งสินค้าให้ผู้ซื้อแล้วใช่ไหม?",
    shipSuccessMsg: "แจ้งจัดส่งสินค้าเรียบร้อยแล้ว",
    shipFailedMsg: "ไม่สามารถแจ้งจัดส่งได้ กรุณาลองใหม่",
    emptyProductsAll:
      "คุณยังไม่มีสินค้าที่วางขาย\nกดปุ่ม Seller เพื่อเริ่มสร้างรายการประมูล",
    emptyProductsCategory: "ไม่มีสินค้าในหมวดนี้",
    shipProduct: "📦 จัดส่งสินค้า",
    shippedLabel: "📦 จัดส่งแล้ว",
    waitingBuyerLabel: "⏳ รอผู้ซื้อ",
    priceCurrent: "ราคาปัจจุบัน",
    priceFinal: "ราคาสุดท้าย",
    priceForSale: "ราคาขาย",
    buyerConfirmedPleaseShip: "✅ ผู้ซื้อยืนยันแล้ว กรุณาจัดส่งสินค้า",
    shippedWaitingBuyerConfirm: "📦 จัดส่งแล้ว รอผู้ซื้อยืนยันรับสินค้า",
    waitingBuyerContact: "⏳ รอผู้ซื้อติดต่อยืนยัน",

    // Product Detail (extended)
    enterBidAmountErr: "กรุณาใส่จำนวนเงิน",
    bidTooLowErr: "ราคาต่ำเกินไป",
    confirmBidTitle: "ยืนยันการบิด",
    confirmBidMsg: "คุณต้องการบิดราคา",
    bidPlacedMsg: "คุณบิดราคาเรียบร้อยแล้ว",
    confirmBuyNowTitle: "ยืนยัน Buy Now",
    buyNowActionBtn: "ซื้อเลย",
    buyNowSuccessMsg: "คุณได้รับสินค้านี้เรียบร้อยแล้ว",
    buyNowFailedTitle: "ซื้อไม่สำเร็จ",
    genericTryAgain: "เกิดข้อผิดพลาด กรุณาลองใหม่",
    minBidLabel: "ขั้นต่ำ",
    bidMinRequired: "กรุณาบิดขั้นต่ำ",

    // Profile (extended)
    unknownUser: "ไม่ระบุชื่อ",

    // Wallet TX fallbacks
    bidPlacedTx: "วางเดิมพัน",
    refundTx: "คืนเงิน",
    saleEarningTx: "รายได้จากการขาย",
    transactionTx: "ธุรกรรม",

    // Help & Support (extended)
    reportTypeScam: "🚨 หลอกลวง (Scam)",
    reportTypeFakeProduct: "📦 สินค้าปลอม",
    reportTypeHarassment: "😡 คุกคาม",
    reportTypeInappropriate: "⚠️ เนื้อหาไม่เหมาะสม",
    reportTypeOther: "📝 อื่นๆ",
    maxEvidenceTitle: "จำกัดจำนวน",
    maxEvidenceMsg: "สามารถแนบรูปหลักฐานได้สูงสุด 5 รูป",
    errSelectReportType: "กรุณาเลือกประเภทปัญหา",
    errEnterReportedUser: "กรุณากรอก ID ผู้ใช้ที่ต้องการรายงาน",
    errEnterReportDesc: "กรุณากรอกรายละเอียดปัญหา",
    reportSubmitFailed: "ไม่สามารถส่งรายงานได้ กรุณาลองใหม่",
    reportReviewing: "กำลังตรวจสอบ",
    reportUnknown: "ไม่ทราบสถานะ",
    faqSubtitle: "กดที่คำถามเพื่อดูคำตอบ",
    reportResponseTime: "ทีมงานจะตอบกลับภายใน 24-48 ชั่วโมง",
    reportSectionTitle: "แจ้งปัญหา / ข้อเสนอแนะ",
    reportStatusTitle: "สถานะการแจ้งปัญหา",
    reportStatusSub: "ติดตามสถานะรายงานที่คุณส่งไป",
    reportedUserIdLabel: "ID ผู้ใช้ที่ต้องการรายงาน *",
    enterReportedUserId: "กรอก ID ผู้ใช้ที่ต้องการรายงาน",
    reportProductIdLabel: "ID สินค้า (ถ้ามี)",
    enterReportedProductId: "กรอก ID สินค้าที่เกี่ยวข้อง (ไม่บังคับ)",
    tapForDetails: "กดเพื่อดูรายละเอียด →",
    reportDetailTitle: "รายละเอียดรายงาน",
    reportDescLabel: "รายละเอียด *",
    reportDescPlaceholder: "อธิบายปัญหาหรือเหตุผลในการรายงาน...",

    // Seller (extended)
    maxPhotosTitle: "รูปภาพสูงสุด",
    maxPhotosMsg: "สามารถอัปโหลดได้สูงสุด 8 รูป",
    needHelp: "ต้องการความช่วยเหลือ?",
    contactSupportDesc: "ติดต่อทีมสนับสนุนของเราได้ตลอด 24 ชั่วโมง",
    selectAmountAndMethod: "เลือกจำนวนเงินและช่องทางชำระเงิน",
    confirmSubmitSlip: "ยืนยันและส่งสลิป",
    uploadSlipToContinue: "อัปโหลดสลิปเพื่อดำเนินการต่อ",
  },
};
