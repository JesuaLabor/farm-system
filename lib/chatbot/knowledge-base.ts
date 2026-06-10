// ============================================================
// Farm System — Chatbot Knowledge Base
// Role-aware Q&A pairs used by Fuse.js for fuzzy matching
// ============================================================

export type UserRole = "farmer" | "buyer" | "lgu" | "expert" | "admin" | "guest";

export interface QAPair {
  id: string;
  roles: UserRole[]; // which roles this answer is relevant to ("all" handled by including all)
  keywords: string[]; // extra keywords to boost matching
  question: string;   // the canonical question (used for display)
  answer: string;     // markdown-safe answer
}

export const knowledgeBase: QAPair[] = [
  // ─────────────────────────────────────────────
  // GENERAL — All Roles
  // ─────────────────────────────────────────────
  {
    id: "gen-001",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["farm system", "what is", "about", "purpose", "platform", "app"],
    question: "What is Farm System?",
    answer:
      "**Farm System** is a web-based platform designed to support local farmers in the Philippines. It connects farmers directly to buyers, helps them access government aid programs, track their finances, and stay informed about market prices — all in one place.",
  },
  {
    id: "gen-002",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["login", "sign in", "access", "enter", "log in"],
    question: "How do I log in?",
    answer:
      "Go to the **Login** page and enter your registered email and password. If you don't have an account yet, click **Register** to create one. Choose your role (Farmer, Buyer, or Agricultural Expert) during registration.",
  },
  {
    id: "gen-003",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["register", "sign up", "create account", "new account", "join"],
    question: "How do I create an account?",
    answer:
      "Click **Register** on the login page. Fill in your name, email, password, and select your role:\n- **Farmer** — to list and sell products\n- **Buyer** — to browse and purchase produce\n- **Agricultural Expert** — to answer forum questions and publish articles\n\nLGU Officers require admin approval after registration.",
  },
  {
    id: "gen-004",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["forgot password", "reset password", "password", "recover"],
    question: "I forgot my password. How do I reset it?",
    answer:
      "On the Login page, click **Forgot Password**. Enter your registered email address and we'll send you a password reset link. Check your inbox (and spam folder) for the reset email.",
  },
  {
    id: "gen-005",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["notification", "bell", "alert", "unread"],
    question: "How do I see my notifications?",
    answer:
      "Click the **bell icon 🔔** in the top navigation bar. The badge shows your unread count. You'll receive notifications for:\n- New orders placed or confirmed\n- Aid application status changes\n- New messages from buyers/farmers\n- Market price alerts\n- Forum answers on your questions",
  },
  {
    id: "gen-006",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["logout", "sign out", "exit", "leave"],
    question: "How do I log out?",
    answer:
      "Click your **profile avatar** or name in the top navigation bar, then select **Logout** from the dropdown menu.",
  },
  {
    id: "gen-007",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["profile", "edit profile", "update info", "personal info", "account settings"],
    question: "How do I update my profile?",
    answer:
      "Go to your **Profile** page by clicking your name in the navigation bar. You can update your personal info, contact details, and profile photo from there.",
  },
  {
    id: "gen-008",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["forum", "community", "question", "ask", "knowledge hub"],
    question: "What is the Community Forum?",
    answer:
      "The **Community Forum** is where all users can ask agricultural questions and get answers. Farmers can ask about crop problems, buyers can ask about seasonal availability, and Agricultural Experts provide verified advice. Find it under **Community → Forum**.",
  },

  // ─────────────────────────────────────────────
  // FARMER — Product & Marketplace
  // ─────────────────────────────────────────────
  {
    id: "far-001",
    roles: ["farmer"],
    keywords: ["list product", "add product", "sell", "create listing", "new product", "post product"],
    question: "How do I list a product for sale?",
    answer:
      "Go to **Farmer → Marketplace** and click **+ Add Product**. Fill in:\n- Crop name, quantity, unit (kg/sack/piece)\n- Price and description\n- Available dates and pickup/delivery options\n- Up to 5 photos\n\nYour location is auto-filled from your profile. Click **Publish** when done.",
  },
  {
    id: "far-002",
    roles: ["farmer"],
    keywords: ["edit listing", "update product", "modify listing", "change price"],
    question: "How do I edit or update my product listing?",
    answer:
      "Go to **Farmer → Marketplace → My Listings**. Find the product you want to edit, click the **⋯ menu** or **Edit** button. You can update price, quantity, description, or photos. Click **Save Changes** when done.",
  },
  {
    id: "far-003",
    roles: ["farmer"],
    keywords: ["delete listing", "remove product", "mark sold", "sold out"],
    question: "How do I mark a product as sold or delete it?",
    answer:
      "In **My Listings**, click the **⋯ menu** on the product card. You can:\n- **Mark as Sold** — hides it from buyers but keeps records\n- **Delete** — permanently removes the listing\n- **Set to Draft** — saves it without publishing",
  },
  {
    id: "far-004",
    roles: ["farmer"],
    keywords: ["my orders", "incoming orders", "accept order", "reject order", "manage orders"],
    question: "How do I manage incoming orders?",
    answer:
      "Go to **Farmer → Orders**. You'll see all orders from buyers. For each order you can:\n- **Accept** — confirms the order\n- **Reject** — cancels with a reason\n- **Mark Ready** — notifies buyer produce is ready\n- **Complete** — closes the transaction\n\nYou'll also get a notification 🔔 when a new order comes in.",
  },
  {
    id: "far-005",
    roles: ["farmer"],
    keywords: ["message buyer", "chat buyer", "contact buyer", "talk to buyer"],
    question: "How do I message a buyer?",
    answer:
      "Open the order in **Farmer → Orders** and click the **💬 Message** button. This opens a real-time chat thread with the buyer specific to that order.",
  },
  {
    id: "far-006",
    roles: ["farmer"],
    keywords: ["dashboard", "farmer dashboard", "overview", "home"],
    question: "What can I see on my Farmer Dashboard?",
    answer:
      "Your **Farmer Dashboard** shows:\n- Active listings and their status\n- Pending and recent orders\n- Current market prices for your crops\n- Weather forecast for your area\n- Notifications summary",
  },

  // ─────────────────────────────────────────────
  // FARMER — Aid Programs
  // ─────────────────────────────────────────────
  {
    id: "far-007",
    roles: ["farmer"],
    keywords: ["aid", "apply aid", "apply for aid", "government aid", "subsidy", "loan", "seed", "training", "programs", "apply program", "aid program", "assistance", "benefits", "grant"],
    question: "How do I apply for a government aid program?",
    answer:
      "Go to **Farmer → Aid Programs**. Browse available programs from your LGU. Click on a program to see:\n- Eligibility requirements\n- Required documents\n- Application deadline\n\nClick **Apply Now**, fill out the form (your profile data is auto-filled), upload required documents, and submit. You'll receive a **reference number** after submitting.",
  },
  {
    id: "far-008",
    roles: ["farmer"],
    keywords: ["application status", "aid status", "check application", "application tracking"],
    question: "How do I track my aid application status?",
    answer:
      "Go to **Farmer → Aid Programs → My Applications**. You'll see the status timeline:\n- 📥 **Submitted** — received by LGU\n- 🔍 **Under Review** — being evaluated\n- ✅ **Approved** — congratulations!\n- ❌ **Rejected** — with reviewer notes\n\nYou'll also get a notification 🔔 whenever the status changes.",
  },
  {
    id: "far-009",
    roles: ["farmer"],
    keywords: ["resubmit", "incomplete documents", "reupload", "fix application"],
    question: "My aid application was returned for incomplete documents. What do I do?",
    answer:
      "In **My Applications**, find the returned application and click **Resubmit**. Upload the missing or corrected documents and submit again. The LGU reviewer's notes will tell you exactly what's needed.",
  },

  // ─────────────────────────────────────────────
  // FARMER — Financial Tracker
  // ─────────────────────────────────────────────
  {
    id: "far-010",
    roles: ["farmer"],
    keywords: ["financial tracker", "income", "expense", "record", "finances", "money", "profit", "loss"],
    question: "How do I use the Financial Tracker?",
    answer:
      "Go to **Farmer → Financial Tracker**. You can:\n- **Add Income** — from crop sales, aid received, or other sources\n- **Add Expense** — seeds, fertilizer, labor, transport, equipment\n- View your **monthly Profit/Loss** summary\n- See charts breaking down income vs. expenses",
  },
  {
    id: "far-011",
    roles: ["farmer"],
    keywords: ["harvest log", "harvest", "log harvest", "record harvest", "crop harvest"],
    question: "How do I record a harvest?",
    answer:
      "Go to **Farmer → Harvest Log** and click **+ Add Harvest Entry**. Fill in:\n- Crop name\n- Quantity and unit\n- Harvest date\n- Field notes (optional)\n\nThis data feeds into your financial reports and LGU monitoring.",
  },
  {
    id: "far-012",
    roles: ["farmer"],
    keywords: ["export", "download report", "pdf", "excel", "financial report", "download", "export records", "save report", "financial records", "download financial", "get report"],
    question: "How do I export my financial records?",
    answer:
      "In **Farmer → Financial Tracker**, click the **Export** button in the top right. Choose:\n- **PDF** — formatted report with charts\n- **Excel/CSV** — spreadsheet with all records\n\nThe export includes your farm name, date range, and a summary.",
  },

  // ─────────────────────────────────────────────
  // BUYER
  // ─────────────────────────────────────────────
  {
    id: "buy-001",
    roles: ["buyer"],
    keywords: ["browse", "find products", "search", "find farmers", "shop", "look for"],
    question: "How do I browse products?",
    answer:
      "Go to **Buyer → Browse**. You can:\n- **Search** by crop name\n- **Filter** by crop type, location (municipality/barangay), price range, and availability\n- **Sort** by newest, price (low to high), or proximity\n- Use the **Map View** to see products pinned by barangay",
  },
  {
    id: "buy-002",
    roles: ["buyer"],
    keywords: ["place order", "buy", "purchase", "order product", "checkout"],
    question: "How do I place an order?",
    answer:
      "Open a product listing and click **Place Order**. Then:\n1. Select the quantity you need\n2. Confirm the total price\n3. Add delivery notes (optional)\n4. Click **Submit Order**\n\nThe farmer will be notified and can accept or reject your order.",
  },
  {
    id: "buy-003",
    roles: ["buyer"],
    keywords: ["contact farmer", "message farmer", "talk to farmer", "chat"],
    question: "How do I contact a farmer?",
    answer:
      "On any product listing page, click the **Contact Farmer** button to open a messaging thread. You can ask questions about the product, negotiate, or coordinate pickup/delivery.",
  },
  {
    id: "buy-004",
    roles: ["buyer"],
    keywords: ["my orders", "order history", "active orders", "track order", "order status"],
    question: "How do I view my orders?",
    answer:
      "Go to **Buyer → My Orders**. You'll see:\n- **Active Orders** — orders in progress (pending, confirmed, ready)\n- **Order History** — completed or cancelled orders\n\nOrder status: `Pending → Confirmed → Ready → Completed`",
  },
  {
    id: "buy-005",
    roles: ["buyer"],
    keywords: ["cancel order", "withdraw order"],
    question: "Can I cancel an order?",
    answer:
      "You can cancel an order while it's still in **Pending** status (before the farmer accepts). Go to **My Orders**, find the order, and click **Cancel Order**. Once a farmer confirms the order, contact them directly via the order chat to discuss.",
  },
  {
    id: "buy-006",
    roles: ["buyer"],
    keywords: ["map", "location", "barangay", "find nearby"],
    question: "How do I use the map to find produce?",
    answer:
      "In **Browse**, click **Map View** (or the map icon). You'll see pins on a Leaflet map showing products available per barangay. Click a pin to see a preview card of that product. You can also filter the map by crop type.",
  },

  // ─────────────────────────────────────────────
  // LGU OFFICER
  // ─────────────────────────────────────────────
  {
    id: "lgu-001",
    roles: ["lgu"],
    keywords: ["post aid", "create program", "add aid program", "new program", "create aid"],
    question: "How do I post a new aid program?",
    answer:
      "Go to **LGU → Aid Management** and click **+ New Program**. Fill in:\n- Title, description, and type (subsidy / loan / seed / training)\n- Eligibility criteria and required documents\n- Application deadline and available slots\n- Contact person\n\nSubmit for admin approval, or if you have publish rights, it goes live immediately.",
  },
  {
    id: "lgu-002",
    roles: ["lgu"],
    keywords: ["review application", "approve application", "reject application", "aid applications"],
    question: "How do I review and approve aid applications?",
    answer:
      "Go to **LGU → Aid Management → Applications**. You can:\n- Filter by program, status, municipality, or date\n- Click an application to view the farmer's submitted documents\n- Click **Approve** ✅ or **Reject** ❌ with notes\n- Download submitted documents for offline review",
  },
  {
    id: "lgu-003",
    roles: ["lgu"],
    keywords: ["farmer directory", "registered farmers", "view farmers", "monitor farmers"],
    question: "How do I view the farmer directory?",
    answer:
      "Go to **LGU → Dashboard → Farmer Directory**. You'll see a table with:\n- Farmer name, barangay, crops grown\n- Registration date and aid application count\n\nClick any row to view the farmer's full profile including farm location on the map.",
  },
  {
    id: "lgu-004",
    roles: ["lgu"],
    keywords: ["report", "generate report", "export report", "compliance", "crop report"],
    question: "How do I generate reports?",
    answer:
      "In the **LGU Dashboard**, click **Generate Report**. Choose:\n- **Compliance Report** — farmers by barangay with aid status\n- **Crop Distribution Report** — production volumes per area\n\nExport as **PDF** or **Excel**.",
  },
  {
    id: "lgu-005",
    roles: ["lgu"],
    keywords: ["market price", "update price", "price management", "crop price"],
    question: "How do I update market prices?",
    answer:
      "Go to **Market Prices** in the navigation (available to LGU and Admin). Click **+ Update Price**, enter the crop name, price per kg, source, and date. This triggers a price alert notification to farmers whose crops changed by more than 10%.",
  },
  {
    id: "lgu-006",
    roles: ["lgu"],
    keywords: ["dashboard", "lgu dashboard", "overview", "statistics", "charts"],
    question: "What can I see on the LGU Dashboard?",
    answer:
      "The **LGU Dashboard** shows:\n- 📊 Total registered farmers, active listings, pending aid applications\n- 🌾 Crop production volume from harvest logs\n- 🗺️ Map of all farmers in your municipality\n- 📈 Crop production bar chart per barangay\n- 🍩 Aid application status pie chart",
  },

  // ─────────────────────────────────────────────
  // EXPERT
  // ─────────────────────────────────────────────
  {
    id: "exp-001",
    roles: ["expert"],
    keywords: ["answer question", "forum answer", "reply", "help farmer"],
    question: "How do I answer a forum question?",
    answer:
      "Go to **Community → Forum** and browse open questions. Click on a question to open it, then scroll to the **Answer** section. Type your response and click **Post Answer**. Your answer will show an **Expert badge** 🏅 so farmers know it's from a verified expert.",
  },
  {
    id: "exp-002",
    roles: ["expert"],
    keywords: ["best answer", "mark answer", "accepted answer"],
    question: "What is a 'Best Answer'?",
    answer:
      "The farmer who posted a question can mark one answer as **Best Answer** ⭐. This highlights the most helpful response at the top. As an expert, encourage farmers to mark yours if it fully addresses their problem.",
  },
  {
    id: "exp-003",
    roles: ["expert"],
    keywords: ["publish article", "write article", "create article", "knowledge hub article"],
    question: "How do I write and publish an article?",
    answer:
      "Go to **Community → Knowledge Hub** and click **+ Write Article**. Fill in:\n- Title, category (pest control / soil / irrigation / etc.)\n- Content (supports rich text/markdown)\n- Tags for searchability\n\nClick **Publish** to make it live, or **Save Draft** to finish later.",
  },
  {
    id: "exp-004",
    roles: ["expert"],
    keywords: ["expert badge", "expert role", "verified"],
    question: "What does my Expert badge mean?",
    answer:
      "Your **Agricultural Expert** badge appears next to your name on all forum answers and articles. It signals to farmers and buyers that your advice is from a qualified professional, increasing trust in your responses.",
  },

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────
  {
    id: "adm-001",
    roles: ["admin"],
    keywords: ["admin dashboard", "platform stats", "overview admin"],
    question: "What does the Admin Dashboard show?",
    answer:
      "The **Admin Dashboard** shows platform-wide statistics:\n- Total users, products, orders, and applications\n- User management table (view, approve, suspend)\n- Content moderation tools\n- Market price management\n- Audit log of all admin actions",
  },
  {
    id: "adm-002",
    roles: ["admin"],
    keywords: ["suspend user", "deactivate user", "ban user", "approve user", "user management"],
    question: "How do I suspend or approve a user?",
    answer:
      "Go to **Admin → Users**. Find the user in the table and click their row. You can:\n- **Approve** — activate LGU officer accounts pending approval\n- **Suspend** — temporarily disable access\n- **Deactivate** — permanently disable the account",
  },
  {
    id: "adm-003",
    roles: ["admin"],
    keywords: ["moderate", "remove post", "delete listing", "content moderation", "flag"],
    question: "How do I moderate content (posts/listings)?",
    answer:
      "In the **Admin Dashboard**, go to **Content Moderation**. You can:\n- View flagged forum posts and product listings\n- **Remove** inappropriate content\n- Send a warning to the content author\n\nAll moderation actions are logged in the **Audit Log**.",
  },
  {
    id: "adm-004",
    roles: ["admin"],
    keywords: ["approve lgu", "lgu registration", "lgu officer approval"],
    question: "How do I approve an LGU Officer registration?",
    answer:
      "When an LGU Officer registers, you receive a notification 🔔. Go to **Admin → Users**, filter by **Pending Approval**, and review their details (municipality, office, ID number). Click **Approve** to grant access or **Reject** with a reason.",
  },

  // ─────────────────────────────────────────────
  // MARKET PRICES — All relevant roles
  // ─────────────────────────────────────────────
  {
    id: "mkt-001",
    roles: ["farmer", "buyer", "lgu", "expert", "admin"],
    keywords: ["market price", "crop price", "price monitor", "current price", "how much"],
    question: "How do I check current market prices?",
    answer:
      "Go to **Market Prices** in the navigation bar. You'll see:\n- Current price per crop (per kg)\n- Color-coded trend: 📈 rising (red) / 📉 falling (green) / ➡️ stable (gray)\n- Price trend chart for the last 30 days (line chart)\n\nFarmers receive automatic alerts when prices change by more than 10%.",
  },
  {
    id: "mkt-002",
    roles: ["farmer", "buyer"],
    keywords: ["price alert", "price notification", "price change", "notify price"],
    question: "How do price alerts work?",
    answer:
      "When the market price of a crop changes by more than **10%** (up or down), farmers with that crop listed receive an automatic notification 🔔. You can see the alert in your notification bell and the price trend chart will show the change.",
  },

  // ─────────────────────────────────────────────
  // WEATHER
  // ─────────────────────────────────────────────
  {
    id: "wth-001",
    roles: ["farmer"],
    keywords: ["weather", "forecast", "rain", "temperature", "humidity", "climate"],
    question: "Where can I see the weather forecast?",
    answer:
      "The **weather widget** is on your **Farmer Dashboard** (home page after login). It shows:\n- Current temperature, humidity, and rain chance\n- 5-day forecast\n\nThe location is based on your **municipality** from your profile. Make sure your municipality is set correctly in your profile for accurate forecasts.",
  },

  // ─────────────────────────────────────────────
  // PEST & DISEASE GUIDE
  // ─────────────────────────────────────────────
  {
    id: "pest-001",
    roles: ["farmer", "buyer", "lgu", "expert", "admin"],
    keywords: ["pest", "disease", "plant disease", "crop disease", "pest guide", "symptoms", "treatment"],
    question: "How do I use the Pest and Disease Guide?",
    answer:
      "Go to **Community → Knowledge Hub → Pest & Disease Guide**. You can:\n- Search by **crop name** (e.g., 'tomato', 'rice')\n- Search by **symptom** (e.g., 'yellow leaves', 'spots')\n- Each entry shows: crop affected, symptoms, photos, and recommended treatment",
  },

  // ─────────────────────────────────────────────
  // TECHNICAL / TROUBLESHOOTING
  // ─────────────────────────────────────────────
  {
    id: "tec-001",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["not working", "error", "problem", "issue", "bug", "broken", "loading", "slow", "app broken", "not loading", "crash", "fix", "trouble", "help", "something wrong"],
    question: "The app is not loading or something isn't working.",
    answer:
      "Here are some quick fixes:\n1. **Refresh the page** (Ctrl+R or ⌘+R)\n2. **Check your internet connection**\n3. **Clear your browser cache** (Ctrl+Shift+Delete)\n4. Try a different browser (Chrome or Firefox recommended)\n\nIf the problem continues, please contact the platform administrator.",
  },
  {
    id: "tec-002",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["upload photo", "upload image", "image upload", "photo not uploading"],
    question: "How do I upload photos to my listing or profile?",
    answer:
      "Click the **camera icon** or **upload area** in any form that accepts photos. You can drag and drop an image or click to browse your files. Supported formats: **JPG, PNG, WEBP**. Maximum file size: **5 MB per image**.",
  },
  {
    id: "tec-003",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["mobile", "phone", "tablet", "responsive", "smartphone"],
    question: "Can I use Farm System on my phone?",
    answer:
      "Yes! Farm System is **fully mobile-responsive**. It works on smartphones and tablets. Farmers have a bottom navigation bar for quick access to their most-used features. For the best experience, use the latest version of **Chrome or Safari** on your phone.",
  },
  {
    id: "tec-004",
    roles: ["farmer", "buyer", "lgu", "expert", "admin", "guest"],
    keywords: ["contact support", "help", "support", "who to contact", "admin contact"],
    question: "How do I contact support?",
    answer:
      "If you need help beyond what the chatbot can answer, please reach out to the platform administrator. You can also use the **Community Forum** to ask other users, or look for answers in the **Knowledge Hub** articles.",
  },
];

// ─────────────────────────────────────────────
// Suggested questions per role (shown on first open)
// ─────────────────────────────────────────────
export const suggestedQuestions: Record<UserRole, string[]> = {
  farmer: [
    "How do I list a product for sale?",
    "How do I apply for a government aid program?",
    "How do I record a harvest?",
    "How do I check current market prices?",
    "Where can I see the weather forecast?",
  ],
  buyer: [
    "How do I browse products?",
    "How do I place an order?",
    "How do I contact a farmer?",
    "How do I view my orders?",
    "How do I use the map to find produce?",
  ],
  lgu: [
    "How do I post a new aid program?",
    "How do I review and approve aid applications?",
    "How do I view the farmer directory?",
    "How do I generate reports?",
    "How do I update market prices?",
  ],
  expert: [
    "How do I answer a forum question?",
    "How do I write and publish an article?",
    "What does my Expert badge mean?",
    "What is the Community Forum?",
  ],
  admin: [
    "What does the Admin Dashboard show?",
    "How do I suspend or approve a user?",
    "How do I approve an LGU Officer registration?",
    "How do I moderate content?",
  ],
  guest: [
    "What is Farm System?",
    "How do I create an account?",
    "What is the Community Forum?",
    "How do I log in?",
  ],
};
