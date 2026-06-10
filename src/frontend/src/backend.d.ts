import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CompetencePricing {
    id: string;
    title: string;
    order: bigint;
    shortDescription: string;
    currency: string;
    isVisible: boolean;
    price: bigint;
}
export interface HeroImageIds {
    presenceImageId?: string;
    slide3ImageId?: string;
    aboutImageId?: string;
    slide1ImageId?: string;
    slide2ImageId?: string;
}
export interface SystemApp {
    id: string;
    url: string;
    order: bigint;
    name: string;
    createdAt: bigint;
    description: string;
    isVisible: boolean;
}
export interface ProjectUpdate {
    id: string;
    title: string;
    content: string;
    isPublished: boolean;
    createdAt: Timestamp;
}
export interface AffiliateProfile {
    status: AffiliateStatus;
    principal: Principal;
    referralCode: string;
    name: string;
    joinedAt: Timestamp;
    rejectionReason?: string;
    email: string;
    inviteCode: string;
}
export interface LeadFilter {
    status?: LeadStatus;
    source?: LeadSource;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    assignedStaff?: Principal;
}
export interface SalesFilter {
    status?: OrderStatus;
    toDate?: Timestamp;
    fromDate?: Timestamp;
    assignedStaff?: Principal;
    product?: string;
}
export interface Lead {
    id: string;
    status: LeadStatus;
    source: LeadSource;
    name: string;
    createdAt: Timestamp;
    affiliateRef?: string;
    email: string;
    updatedAt: Timestamp;
    message: string;
    notes: string;
    assignedStaff?: Principal;
    phone?: string;
}
export interface ContactMessage {
    id: bigint;
    messageText: string;
    timestamp: bigint;
    senderName: string;
}
export interface SecurityPolicy {
    sessionTimeoutMins: bigint;
    maxLoginAttempts: bigint;
    rateLimitPerMin: bigint;
    rateLimitPublicPerMin: bigint;
    lockoutDurationMins: bigint;
}
export interface PaymentConfigPublic {
    localBank?: LocalBankConfig;
    servicePriceNgn: bigint;
    paystackPublicKey?: string;
    enabledMethods: Array<Variant_localBank_paystack_flutterwave>;
    defaultCurrency: string;
    flutterwavePublicKey?: string;
}
export interface ContactDetails {
    x?: string;
    linkedin?: string;
    snapchat?: string;
    tiktok?: string;
    otherLinks: Array<ContactLink>;
    instagram?: string;
    whatsapp?: string;
    email?: string;
    updatedAt: Timestamp;
    facebook?: string;
    phone?: string;
}
export interface PaymentOrder {
    status: PaymentOrderStatus;
    method: Variant_localBank_paystack_flutterwave;
    payerEmail: string;
    approvedBy?: Principal;
    createdAt: Timestamp;
    payerPhone?: string;
    orderId: bigint;
    updatedAt: Timestamp;
    currency: string;
    notes?: string;
    amount: bigint;
    payerName: string;
    webhookRef?: string;
}
export interface AffiliateStats {
    totalLeads: bigint;
    totalClicks: bigint;
    totalConversions: bigint;
    totalCommissionEarned: number;
    pendingPayout: number;
}
export interface FinanceSummary {
    entryCount: bigint;
    totalIncome: bigint;
    totalExpenses: bigint;
    netBalance: bigint;
}
export interface CryptoPaymentConfig {
    usdcEnabled: boolean;
    paymentInstructions: string;
    network: string;
    usdtWalletAddress: string;
    eligibleOfferIds: Array<string>;
    usdcWalletAddress: string;
    enabled: boolean;
}
export interface CreateProjectRequest {
    clientName: string;
    projectDescription: string;
    tier: ConsultingTier;
    clientEmail: string;
    clientPrincipal: Principal;
    projectTitle: string;
    expectedEndDate?: Timestamp;
    startDate: Timestamp;
}
export interface AboutSection {
    bio: string;
    title: string;
}
export interface ActivityLog {
    id: string;
    action: string;
    actorRole: UserRole;
    actorId: Principal;
    target: string;
    timestamp: Timestamp;
    ipAddress?: IpAddress;
}
export interface ContactPlatform {
    id: string;
    url: string;
    order: bigint;
    platformKey: string;
    displayLabel?: string;
    isVisible: boolean;
    platformName: string;
}
export interface Bundle {
    id: string;
    title: string;
    order: bigint;
    description: string;
    bundlePrice: bigint;
    currency: string;
    includedServiceIds: Array<string>;
    isVisible: boolean;
}
export interface SystemConfig {
    siteTitle: string;
    ctaGetLandingPage: string;
    brandTagline: string;
    maintenanceMode: boolean;
    siteDescription: string;
    environment: string;
    heroHeadline: string;
    ctaWorkWithMe: string;
    competenceSectionVisible: boolean;
    ctaExploreSystems: string;
    heroSubtext: string;
    footerText: string;
    ctaViewCompetence: string;
}
export interface PricingData {
    giveaways: Array<GiveawayItem>;
    bundles: Array<Bundle>;
    landingPageOffers: Array<LandingPageOffer>;
    consultancyServices: Array<ConsultancyService>;
    competencePricing: Array<CompetencePricing>;
}
export interface SalesStats {
    pendingPayments: bigint;
    totalOrders: bigint;
    totalRevenue: number;
}
export interface Order {
    id: string;
    customerName: string;
    status: OrderStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    notes: string;
    assignedStaff?: Principal;
    customerId?: Principal;
    amount: number;
    customerEmail: string;
    product: string;
}
export interface NextStep {
    id: string;
    isCompleted: boolean;
    order: bigint;
    description: string;
}
export interface HeroSlide {
    body: string;
    headline: string;
    button1: SlideButton;
    button2: SlideButton;
    subheadline: string;
}
export interface ClientProject {
    id: string;
    completedDate?: Timestamp;
    status: ClientProjectStatus;
    nextSteps: Array<NextStep>;
    clientName: string;
    projectDescription: string;
    createdAt: Timestamp;
    tier: ConsultingTier;
    clientEmail: string;
    clientPrincipal: Principal;
    updatedAt: Timestamp;
    projectTitle: string;
    updates: Array<ProjectUpdate>;
    deliverables: Array<Deliverable>;
    expectedEndDate?: Timestamp;
    startDate: Timestamp;
}
export interface HelpBlock {
    title: string;
    description: string;
}
export interface VersionInfo {
    systemVersion: string;
    buildVersion: bigint;
    lastDeployedAt: bigint;
    environment: string;
}
export interface UpdateProjectRequest {
    completedDate?: Timestamp;
    status?: ClientProjectStatus;
    projectDescription?: string;
    projectTitle?: string;
    expectedEndDate?: Timestamp;
}
export type Timestamp = bigint;
export type SubmitResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface PayoutRecord {
    id: string;
    status: PayoutStatus;
    method: string;
    processedAt?: Timestamp;
    affiliateId: string;
    adjustmentNote: string;
    amount: number;
    requestedAt: Timestamp;
    adjustedBy?: Principal;
}
export interface PaystackConfig {
    webhookSecret: string;
    publicKey: string;
    secretKey: string;
}
export interface LegalContent {
    id: string;
    title: string;
    content: string;
    lastUpdated: bigint;
}
export interface Deliverable {
    id: string;
    url?: string;
    title: string;
    isAvailable: boolean;
    description: string;
    fileType?: string;
    uploadedAt: Timestamp;
}
export interface AuditLog {
    ip?: IpAddress;
    userRole: UserRole;
    resource: string;
    action: AuditAction;
    userId: Principal;
    logId: bigint;
    timestamp: Timestamp;
    details: string;
}
export interface ContactLinks {
    primaryCtaText: string;
    instagram: string;
    whatsapp: string;
    email: string;
    facebook: string;
}
export interface GalleryVideoInput {
    url: string;
    title: string;
    description: string;
    isFeatured: boolean;
    isVisible: boolean;
}
export interface SlideButton {
    href: string;
    text: string;
}
export interface ConsultancyService {
    id: string;
    title: string;
    order: bigint;
    description: string;
    currency: string;
    isVisible: boolean;
    price: bigint;
}
export interface StaffUser {
    id: Principal;
    status: Variant_active_pending_inactive;
    permissions: Array<Permission>;
    lastLoginAt?: Timestamp;
    role: UserRole;
    invitedAt: Timestamp;
    email: string;
}
export interface LeadStats {
    totalLeads: bigint;
    newLeads: bigint;
    qualifiedLeads: bigint;
}
export interface GalleryImage {
    id: bigint;
    storageId: string;
    caption: string;
    uploadedAt: Timestamp;
}
export interface CommissionSettings {
    defaultRate: number;
    overrideRates: Array<[string, number]>;
}
export type IpAddress = string;
export interface GalleryVideo {
    id: bigint;
    url: string;
    title: string;
    description: string;
    isFeatured: boolean;
    isVisible: boolean;
    uploadedAt: Timestamp;
}
export interface BuyerLead {
    id: bigint;
    status: BuyerLeadStatus;
    assignedTo?: Principal;
    projectDescription: string;
    name: string;
    createdAt: Timestamp;
    businessName: string;
    businessType: string;
    email: string;
    updatedAt: Timestamp;
    notes?: string;
    formSource: FormSource;
    phone: string;
    budgetRange: string;
    timeline: string;
}
export interface LocalBankConfig {
    bankName: string;
    accountName: string;
    accountNumber: string;
}
export interface LandingPageOffer {
    id: string;
    tag?: string;
    title: string;
    tier: string;
    description: string;
    currency: string;
    isVisible: boolean;
    price: bigint;
}
export interface ContactLink {
    url: string;
    name: string;
}
export interface PaymentConfig {
    localBank?: LocalBankConfig;
    servicePriceNgn: bigint;
    updatedAt: Timestamp;
    enabledMethods: Array<Variant_localBank_paystack_flutterwave>;
    paystack?: PaystackConfig;
    defaultCurrency: string;
    flutterwave?: FlutterwaveConfig;
}
export interface FlutterwaveConfig {
    webhookSecret: string;
    publicKey: string;
    secretKey: string;
}
export interface SignatureEdge {
    quote: string;
    pillar1: string;
    pillar2: string;
    pillar3: string;
}
export interface DeploymentEntry {
    deployedAt: bigint;
    note: string;
    version: bigint;
}
export interface TrainingModule {
    id: bigint;
    title: string;
    order: bigint;
    videoStorageId?: string;
    createdAt: Timestamp;
    description: string;
    textContent: string;
}
export interface CompetenceCard {
    title: string;
    description: string;
    isVisible: boolean;
}
export interface FinanceEntry {
    id: bigint;
    entryType: EntryType;
    date: string;
    createdAt: Timestamp;
    description: string;
    amount: bigint;
}
export interface BlockEntry {
    key: string;
    blockedAt: bigint;
    reason: string;
}
export interface CryptoPaymentPublic {
    usdcEnabled: boolean;
    paymentInstructions: string;
    network: string;
    usdtWalletAddress: string;
    usdcWalletAddress: string;
    enabled: boolean;
}
export type RoleResult = {
    __kind__: "ok";
    ok: string;
} | {
    __kind__: "err";
    err: string;
};
export interface GiveawayItem {
    id: string;
    title: string;
    order: bigint;
    description: string;
    isFree: boolean;
    isActive: boolean;
    currency: string;
    isVisible: boolean;
    discountedPrice?: bigint;
}
export interface LiveSession {
    id: bigint;
    title: string;
    joinLink: string;
    date: Timestamp;
    createdAt: Timestamp;
    description: string;
}
export interface Testimonial {
    role: string;
    text: string;
    author: string;
    isVisible: boolean;
}
export enum AffiliateStatus {
    pending = "pending",
    disabled = "disabled",
    approved = "approved",
    rejected = "rejected"
}
export enum AuditAction {
    Login = "Login",
    AccessDenied = "AccessDenied",
    Approve = "Approve",
    Reject = "Reject",
    Logout = "Logout",
    Delete = "Delete",
    Create = "Create",
    Update = "Update"
}
export enum BuyerLeadStatus {
    New = "New",
    Contacted = "Contacted",
    Converted = "Converted",
    Rejected = "Rejected"
}
export enum ClientProjectStatus {
    OnHold = "OnHold",
    UnderReview = "UnderReview",
    InProgress = "InProgress",
    Completed = "Completed",
    Pending = "Pending"
}
export enum ConsultingTier {
    BakerySetupAndRecipes = "BakerySetupAndRecipes",
    BusinessDevelopment = "BusinessDevelopment",
    Advisory = "Advisory",
    BakerySetup = "BakerySetup"
}
export enum EntryType {
    expense = "expense",
    income = "income"
}
export enum FormSource {
    Hero = "Hero",
    Footer = "Footer",
    MidPage = "MidPage"
}
export enum LeadSource {
    other = "other",
    training_enrollment = "training_enrollment",
    contact_form = "contact_form",
    affiliate_signup = "affiliate_signup"
}
export enum LeadStatus {
    new_ = "new",
    rejected = "rejected",
    contacted = "contacted",
    converted = "converted",
    qualified = "qualified"
}
export enum OrderStatus {
    pending = "pending",
    completed = "completed",
    refunded = "refunded",
    failed = "failed"
}
export enum PaymentOrderStatus {
    Failed = "Failed",
    Rejected = "Rejected",
    Completed = "Completed",
    Pending = "Pending"
}
export enum PayoutStatus {
    pending = "pending",
    completed = "completed"
}
export enum Permission {
    CanViewReports = "CanViewReports",
    CanManageRoles = "CanManageRoles",
    CanManageTraining = "CanManageTraining",
    CanManageMedia = "CanManageMedia",
    CanManageBuyerLeads = "CanManageBuyerLeads",
    CanManagePayments = "CanManagePayments",
    CanViewDashboard = "CanViewDashboard",
    CanManageSecurity = "CanManageSecurity",
    CanManageLeads = "CanManageLeads",
    CanManageSales = "CanManageSales",
    CanManageFinance = "CanManageFinance",
    CanManageStaff = "CanManageStaff",
    CanEditContent = "CanEditContent",
    CanViewAuditLog = "CanViewAuditLog",
    CanManageAffiliates = "CanManageAffiliates",
    CanEditContactDetails = "CanEditContactDetails"
}
export enum UserRole {
    Customer = "Customer",
    Staff = "Staff",
    PlatformOwner = "PlatformOwner",
    Affiliate = "Affiliate",
    Admin = "Admin"
}
export enum Variant_active_pending_inactive {
    active = "active",
    pending = "pending",
    inactive = "inactive"
}
export enum Variant_localBank_paystack_flutterwave {
    localBank = "localBank",
    paystack = "paystack",
    flutterwave = "flutterwave"
}
export interface backendInterface {
    adminAddDeliverable(projectId: string, deliverable: Deliverable): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddFinanceEntry(entryType: EntryType, amount: bigint, description: string, date: string): Promise<void>;
    adminAddGalleryImage(storageId: string, caption: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddGalleryVideo(input: GalleryVideoInput): Promise<{
        __kind__: "ok";
        ok: GalleryVideo;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddNextStep(projectId: string, description: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddOrder(customerName: string, customerEmail: string, product: string, amount: number, notes: string, customerId: Principal | null, assignedStaff: Principal | null): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddPayout(record: PayoutRecord): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddSystemApp(name: string, description: string, url: string): Promise<{
        __kind__: "ok";
        ok: SystemApp;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAddUpdate(projectId: string, title: string, content: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminAdjustCommission(affiliateId: string, amount: number, reason: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminApproveAffiliate(affiliatePrincipal: Principal): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminApprovePaymentOrder(orderId: bigint, approve: boolean, notes: string | null): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminBlockKey(key: string, reason: string): Promise<void>;
    adminCreateLiveSession(title: string, description: string, date: bigint, joinLink: string): Promise<void>;
    adminCreateProject(req: CreateProjectRequest): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminCreateTrainingModule(title: string, description: string, videoStorageId: string | null, textContent: string, order: bigint): Promise<void>;
    adminDeleteFinanceEntry(id: bigint): Promise<void>;
    adminDeleteGalleryImage(id: bigint): Promise<void>;
    adminDeleteGalleryVideo(id: bigint): Promise<void>;
    adminDeleteLiveSession(id: bigint): Promise<void>;
    adminDeleteSystemApp(id: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteTrainingModule(id: bigint): Promise<void>;
    adminDisableAffiliate(affiliatePrincipal: Principal): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminEditGalleryVideo(id: bigint, input: GalleryVideoInput): Promise<{
        __kind__: "ok";
        ok: GalleryVideo;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminEditSystemApp(id: string, name: string, description: string, url: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAffiliateStats(affiliateId: string): Promise<AffiliateStats>;
    adminGetAffiliates(): Promise<Array<AffiliateProfile>>;
    adminGetAllContactPlatforms(): Promise<Array<ContactPlatform>>;
    adminGetAllLegalContent(): Promise<Array<LegalContent>>;
    adminGetAllProjects(): Promise<{
        __kind__: "ok";
        ok: Array<ClientProject>;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetAllTestimonials(): Promise<Array<Testimonial>>;
    adminGetBlockedKeys(): Promise<Array<BlockEntry>>;
    adminGetBrandTagline(): Promise<string>;
    adminGetCompetenceCards(): Promise<Array<CompetenceCard>>;
    adminGetCompetenceSectionVisible(): Promise<boolean>;
    adminGetContactLinks(): Promise<ContactLinks>;
    adminGetContactMessages(): Promise<Array<ContactMessage>>;
    adminGetCryptoPaymentConfig(): Promise<{
        __kind__: "ok";
        ok: CryptoPaymentConfig;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetDeploymentLog(): Promise<Array<DeploymentEntry>>;
    adminGetFinanceEntries(): Promise<Array<FinanceEntry>>;
    adminGetFinanceSummary(): Promise<FinanceSummary>;
    adminGetGalleryImages(): Promise<Array<GalleryImage>>;
    adminGetGalleryVideos(): Promise<Array<GalleryVideo>>;
    adminGetHeroImageIds(): Promise<HeroImageIds>;
    adminGetLead(id: string): Promise<Lead | null>;
    adminGetLeadStats(): Promise<LeadStats>;
    adminGetLeads(filter: LeadFilter): Promise<Array<Lead>>;
    adminGetOrder(id: string): Promise<Order | null>;
    adminGetOrders(filter: SalesFilter): Promise<Array<Order>>;
    adminGetPaymentConfig(): Promise<PaymentConfig>;
    adminGetPayoutHistory(affiliateId: string): Promise<Array<PayoutRecord>>;
    adminGetPricingData(): Promise<PricingData>;
    adminGetProjectById(id: string): Promise<{
        __kind__: "ok";
        ok: ClientProject;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminGetSalesStats(): Promise<SalesStats>;
    adminGetSecurityPolicy(): Promise<SecurityPolicy>;
    adminGetSystemsApps(): Promise<Array<SystemApp>>;
    adminGetTrainingModules(): Promise<Array<TrainingModule>>;
    adminListAuditLogs(limit: bigint | null): Promise<Array<AuditLog>>;
    adminListBuyerLeads(statusFilter: BuyerLeadStatus | null, sourceFilter: FormSource | null): Promise<Array<BuyerLead>>;
    adminListPaymentOrders(): Promise<Array<PaymentOrder>>;
    adminRegisterAffiliate(affiliatePrincipal: Principal, inviteCode: string, name: string, email: string): Promise<void>;
    adminRejectAffiliate(affiliatePrincipal: Principal, reason: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminReorderPlatform(id: string, newOrder: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetAbout(section: AboutSection): Promise<void>;
    adminSetBrandTagline(tagline: string): Promise<void>;
    adminSetBundles(bundles: Array<Bundle>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetCommission(settings: CommissionSettings): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetCompetenceCards(cards: Array<CompetenceCard>): Promise<void>;
    adminSetCompetencePricing(pricing: Array<CompetencePricing>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetCompetenceSectionVisible(visible: boolean): Promise<void>;
    adminSetConsultancyServices(services: Array<ConsultancyService>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetContactDetails(payload: ContactDetails): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetContactLinks(links: ContactLinks): Promise<void>;
    adminSetContactPlatforms(platforms: Array<ContactPlatform>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetCryptoPaymentConfig(config: CryptoPaymentConfig): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetGiveaways(giveaways: Array<GiveawayItem>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetHelpBlocks(blocks: Array<HelpBlock>): Promise<void>;
    adminSetHeroImageIds(ids: HeroImageIds): Promise<void>;
    adminSetHeroSlides(slides: Array<HeroSlide>): Promise<void>;
    adminSetLandingPageOffers(offers: Array<LandingPageOffer>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetLegalContent(id: string, title: string, content: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetPaymentConfig(payload: PaymentConfig): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetSecurityPolicy(newPolicy: SecurityPolicy): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetSignatureEdge(edge: SignatureEdge): Promise<void>;
    adminSetTestimonials(items: Array<Testimonial>): Promise<void>;
    adminSetWebhookSecretHash(provider: string, secretHash: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminToggleGalleryVideoFeatured(id: bigint): Promise<{
        __kind__: "ok";
        ok: GalleryVideo;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminToggleGalleryVideoVisibility(id: bigint): Promise<{
        __kind__: "ok";
        ok: GalleryVideo;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminTogglePlatformVisibility(id: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminTogglePricingItemVisibility(itemType: string, id: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminToggleSystemApp(id: string): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUnblockKey(key: string): Promise<void>;
    adminUpdateBuyerLeadStatus(leadId: bigint, newStatus: BuyerLeadStatus, notes: string | null): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateLead(id: string, name: string, email: string, phone: string | null, message: string, source: LeadSource, status: LeadStatus, notes: string, assignedStaff: Principal | null, affiliateRef: string | null, createdAt: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateLiveSession(id: bigint, title: string, description: string, date: bigint, joinLink: string): Promise<void>;
    adminUpdateNextStep(projectId: string, stepId: string, isCompleted: boolean): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateOrder(id: string, customerName: string, customerEmail: string, product: string, amount: number, status: OrderStatus, notes: string, customerId: Principal | null, assignedStaff: Principal | null, createdAt: bigint): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdatePayoutRecord(id: string, status: PayoutStatus, adjustedBy: Principal | null, adjustmentNote: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateProject(projectId: string, req: UpdateProjectRequest): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateSystemConfig(cfg: SystemConfig): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminUpdateTrainingModule(id: bigint, title: string, description: string, videoStorageId: string | null, textContent: string, order: bigint): Promise<void>;
    affiliateGetInviteLink(): Promise<string>;
    affiliateGetPayoutHistory(): Promise<Array<PayoutRecord>>;
    affiliateGetProfile(): Promise<AffiliateProfile>;
    affiliateGetStats(): Promise<AffiliateStats>;
    affiliateRequestPayout(method: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    assignUserRole(target: Principal, role: UserRole, email: string, permissions: Array<Permission>): Promise<RoleResult>;
    claimOwnership(email: string): Promise<RoleResult>;
    clientGetMyProject(): Promise<{
        __kind__: "ok";
        ok: ClientProject;
    } | {
        __kind__: "err";
        err: string;
    }>;
    confirmOwnership(): Promise<{
        role?: UserRole;
        isOwnerOrAdmin: boolean;
    }>;
    createPaymentOrder(payerName: string, payerEmail: string, payerPhone: string | null, method: Variant_localBank_paystack_flutterwave): Promise<{
        __kind__: "ok";
        ok: PaymentOrder;
    } | {
        __kind__: "err";
        err: string;
    }>;
    flutterwaveWebhook(body: string, signature: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getAbout(): Promise<AboutSection>;
    getActivityLog(limit: bigint): Promise<Array<ActivityLog>>;
    getBrandTagline(): Promise<string>;
    getCompetenceCards(): Promise<Array<CompetenceCard>>;
    getCompetenceCardsVisible(): Promise<Array<CompetenceCard>>;
    getCompetenceSectionVisible(): Promise<boolean>;
    getContactDetails(): Promise<ContactDetails>;
    getContactLinks(): Promise<ContactLinks>;
    getContactPlatforms(): Promise<Array<ContactPlatform>>;
    getGalleryImages(): Promise<Array<GalleryImage>>;
    getGalleryVideos(): Promise<Array<GalleryVideo>>;
    getHelpBlocks(): Promise<Array<HelpBlock>>;
    getHeroImageIds(): Promise<HeroImageIds>;
    getHeroSlides(): Promise<Array<HeroSlide>>;
    getLegalContent(id: string): Promise<LegalContent | null>;
    getLiveSessions(): Promise<Array<LiveSession>>;
    getMyRole(): Promise<UserRole | null>;
    getOwnerDebugInfo(): Promise<{
        ownerEmail: string;
        callerRole: string;
        callerIsOwner: boolean;
        callerEmail?: string;
    }>;
    getPaymentConfig(): Promise<PaymentConfigPublic>;
    getPricingData(): Promise<PricingData>;
    getPublicCryptoPaymentInfo(): Promise<CryptoPaymentPublic | null>;
    getSignatureEdge(): Promise<SignatureEdge>;
    getSystemConfig(): Promise<SystemConfig>;
    getSystemsApps(): Promise<Array<SystemApp>>;
    getTestimonials(): Promise<Array<Testimonial>>;
    getTrainingModules(): Promise<Array<TrainingModule>>;
    getUserRole(target: Principal): Promise<UserRole | null>;
    getVersionInfo(): Promise<VersionInfo>;
    getVisibleTestimonials(): Promise<Array<Testimonial>>;
    listUsersByRole(role: UserRole): Promise<Array<StaffUser>>;
    paystackWebhook(body: string, signature: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    revokeUserRole(target: Principal): Promise<RoleResult>;
    submitBuyerLead(name: string, email: string, phone: string, businessName: string, businessType: string, projectDescription: string, timeline: string, budgetRange: string, formSource: FormSource, honeypot: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitContactMessage(senderName: string, messageText: string, honeypot: string): Promise<SubmitResult>;
    trackReferralClick(affiliateId: string, source: string): Promise<void>;
}
