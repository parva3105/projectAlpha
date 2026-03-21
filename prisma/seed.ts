import { PrismaClient, DealStage, ContractStatus, PaymentStatus, BriefStatus } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Brands ─────────────────────────────────────────────────────────────────
  const [lumina, peakfit, novu, harvest] = await Promise.all([
    db.brand.upsert({
      where: { id: 'brand_seed_001' },
      update: {},
      create: { id: 'brand_seed_001', name: 'Lumina Beauty', website: 'https://luminabeauty.com' },
    }),
    db.brand.upsert({
      where: { id: 'brand_seed_002' },
      update: {},
      create: { id: 'brand_seed_002', name: 'PeakFit Gear', website: 'https://peakfitgear.com' },
    }),
    db.brand.upsert({
      where: { id: 'brand_seed_003' },
      update: {},
      create: { id: 'brand_seed_003', name: 'Novu Tech', website: 'https://novutech.io' },
    }),
    db.brand.upsert({
      where: { id: 'brand_seed_004' },
      update: {},
      create: { id: 'brand_seed_004', name: 'Harvest & Co', website: null },
    }),
  ])
  console.log('✅ Brands seeded')

  // ── Creators ───────────────────────────────────────────────────────────────
  const [aria, marcus, dani, jordan, sam] = await Promise.all([
    db.creator.upsert({
      where: { clerkId: 'test_creator_001' },
      update: {},
      create: {
        id: 'creator_seed_001',
        clerkId: 'test_creator_001',
        name: 'Aria Chen',
        handle: 'aria.chen',
        bio: 'Lifestyle & wellness creator based in NYC. Turning everyday moments into inspiration.',
        platforms: ['Instagram', 'TikTok'],
        nicheTags: ['Wellness', 'Lifestyle', 'Fitness'],
        followerCount: 185000,
        engagementRate: 4.2,
        isPublic: true,
        agencyClerkId: 'test_agency_001',
      },
    }),
    db.creator.upsert({
      where: { clerkId: 'test_creator_002' },
      update: {},
      create: {
        id: 'creator_seed_002',
        clerkId: 'test_creator_002',
        name: 'Marcus Webb',
        handle: 'marcuswebb',
        bio: 'Tech reviews, unboxings, and the honest take you didn\'t know you needed.',
        platforms: ['YouTube', 'Twitter'],
        nicheTags: ['Tech', 'Gadgets', 'Reviews'],
        followerCount: 430000,
        engagementRate: 3.1,
        isPublic: true,
        agencyClerkId: 'test_agency_001',
      },
    }),
    db.creator.upsert({
      where: { clerkId: 'test_creator_003' },
      update: {},
      create: {
        id: 'creator_seed_003',
        clerkId: 'test_creator_003',
        name: 'Dani Flores',
        handle: 'dani.flores',
        bio: 'Food & travel. If it tastes good or has a good view, I\'m there.',
        platforms: ['Instagram', 'YouTube'],
        nicheTags: ['Food', 'Travel', 'Lifestyle'],
        followerCount: 92000,
        engagementRate: 5.8,
        isPublic: true,
        agencyClerkId: 'test_agency_001',
      },
    }),
    db.creator.upsert({
      where: { clerkId: 'test_creator_004' },
      update: {},
      create: {
        id: 'creator_seed_004',
        clerkId: 'test_creator_004',
        name: 'Jordan Park',
        handle: 'jordanpark',
        bio: 'Fashion-forward, unapologetically me. Styling tips for real people.',
        platforms: ['Instagram', 'TikTok', 'Pinterest'],
        nicheTags: ['Fashion', 'Style', 'Beauty'],
        followerCount: 670000,
        engagementRate: 2.9,
        isPublic: true,
        agencyClerkId: 'test_agency_001',
      },
    }),
    db.creator.upsert({
      where: { clerkId: 'test_creator_005' },
      update: {},
      create: {
        id: 'creator_seed_005',
        clerkId: 'test_creator_005',
        name: 'Sam Rivera',
        handle: 'samrivera',
        bio: 'Finance & investing made simple. Building wealth one video at a time.',
        platforms: ['YouTube', 'LinkedIn'],
        nicheTags: ['Finance', 'Investing', 'Business'],
        followerCount: 210000,
        engagementRate: 6.1,
        isPublic: false,
        agencyClerkId: 'test_agency_001',
      },
    }),
  ])
  console.log('✅ Creators seeded')

  // ── Deals (one per stage) ──────────────────────────────────────────────────
  const deals: Array<{
    id: string
    title: string
    stage: DealStage
    brandId: string
    creatorId: string | null
    dealValue: number
    commissionPct: number
    contractStatus: ContractStatus
    paymentStatus: PaymentStatus
    deadline: Date
    notes: string
  }> = [
    {
      id: 'deal_seed_001',
      title: 'Spring Skincare Launch',
      stage: 'BRIEF_RECEIVED',
      brandId: lumina.id,
      creatorId: null,
      dealValue: 350000,
      commissionPct: 20,
      contractStatus: 'NOT_SENT',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-04-15'),
      notes: 'Brand wants 3 Instagram posts and 1 Reel.',
    },
    {
      id: 'deal_seed_002',
      title: 'Summer Fitness Campaign',
      stage: 'CREATOR_ASSIGNED',
      brandId: peakfit.id,
      creatorId: aria.id,
      dealValue: 500000,
      commissionPct: 15,
      contractStatus: 'NOT_SENT',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-05-01'),
      notes: '2 TikTok videos, 1 Instagram story series.',
    },
    {
      id: 'deal_seed_003',
      title: 'Novu Laptop Pro Review',
      stage: 'CONTRACT_SENT',
      brandId: novu.id,
      creatorId: marcus.id,
      dealValue: 800000,
      commissionPct: 20,
      contractStatus: 'SENT',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-04-20'),
      notes: 'Long-form YouTube review + 2 Twitter threads.',
    },
    {
      id: 'deal_seed_004',
      title: 'Glow Serum Unboxing',
      stage: 'IN_PRODUCTION',
      brandId: lumina.id,
      creatorId: dani.id,
      dealValue: 220000,
      commissionPct: 25,
      contractStatus: 'SIGNED',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-04-10'),
      notes: 'Short-form Instagram + YouTube Shorts.',
    },
    {
      id: 'deal_seed_005',
      title: 'PeakFit Protein Series',
      stage: 'PENDING_APPROVAL',
      brandId: peakfit.id,
      creatorId: sam.id,
      dealValue: 450000,
      commissionPct: 20,
      contractStatus: 'SIGNED',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-03-25'),
      notes: '3 YouTube Shorts, finance + fitness crossover angle.',
    },
    {
      id: 'deal_seed_006',
      title: 'Harvest Table Feature',
      stage: 'LIVE',
      brandId: harvest.id,
      creatorId: dani.id,
      dealValue: 180000,
      commissionPct: 20,
      contractStatus: 'SIGNED',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-03-10'),
      notes: 'Farm-to-table recipe post + Instagram stories.',
    },
    {
      id: 'deal_seed_007',
      title: 'Novu Wireless Earbuds Drop',
      stage: 'PAYMENT_PENDING',
      brandId: novu.id,
      creatorId: marcus.id,
      dealValue: 600000,
      commissionPct: 20,
      contractStatus: 'SIGNED',
      paymentStatus: 'PENDING',
      deadline: new Date('2026-03-01'),
      notes: 'YouTube video + Twitter thread series.',
    },
    {
      id: 'deal_seed_008',
      title: 'Holiday Gift Set Campaign',
      stage: 'CLOSED',
      brandId: lumina.id,
      creatorId: aria.id,
      dealValue: 750000,
      commissionPct: 15,
      contractStatus: 'SIGNED',
      paymentStatus: 'RECEIVED',
      deadline: new Date('2025-12-20'),
      notes: 'Holiday series — 4 Instagram posts over 2 weeks.',
    },
  ]

  for (const d of deals) {
    const creatorPayout = Math.round(d.dealValue * (1 - d.commissionPct / 100))
    await db.deal.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        agencyClerkId: 'test_agency_001',
        title: d.title,
        stage: d.stage,
        brandId: d.brandId,
        creatorId: d.creatorId,
        dealValue: d.dealValue,
        commissionPct: d.commissionPct,
        creatorPayout,
        contractStatus: d.contractStatus,
        paymentStatus: d.paymentStatus,
        deadline: d.deadline,
        notes: d.notes,
      },
    })
  }
  console.log('✅ Deals seeded (8 — one per stage)')

  // ── Content Submissions (on PENDING_APPROVAL deal) ─────────────────────────
  await db.contentSubmission.upsert({
    where: { id: 'sub_seed_001' },
    update: {},
    create: {
      id: 'sub_seed_001',
      dealId: 'deal_seed_005',
      creatorId: sam.id,
      round: 1,
      url: 'https://youtube.com/watch?v=example',
      status: 'PENDING',
    },
  })
  await db.contentSubmission.upsert({
    where: { id: 'sub_seed_002' },
    update: {},
    create: {
      id: 'sub_seed_002',
      dealId: 'deal_seed_006',
      creatorId: dani.id,
      round: 1,
      url: 'https://instagram.com/p/example',
      status: 'APPROVED',
      reviewedAt: new Date('2026-03-09'),
    },
  })
  console.log('✅ Content submissions seeded')

  // ── Briefs ─────────────────────────────────────────────────────────────────
  await db.brief.upsert({
    where: { id: 'brief_seed_001' },
    update: {},
    create: {
      id: 'brief_seed_001',
      brandManagerClerkId: 'test_brand_001',
      agencyClerkId: 'test_agency_001',
      title: 'Summer Hydration Campaign',
      description: 'Looking for a wellness creator to showcase our electrolyte drink line across Instagram and TikTok. Deliverables: 2 posts + 3 stories.',
      budget: 300000,
      platform: 'Instagram',
      niche: 'Wellness',
      status: 'NEW' as BriefStatus,
    },
  })
  await db.brief.upsert({
    where: { id: 'brief_seed_002' },
    update: {},
    create: {
      id: 'brief_seed_002',
      brandManagerClerkId: 'test_brand_001',
      agencyClerkId: 'test_agency_001',
      title: 'Back to School Tech Drop',
      description: 'Review our new student laptop aimed at Gen Z. YouTube long-form preferred. Creator must have tech-savvy audience.',
      budget: 600000,
      platform: 'YouTube',
      niche: 'Tech',
      status: 'REVIEWED' as BriefStatus,
    },
  })
  await db.brief.upsert({
    where: { id: 'brief_seed_003' },
    update: {},
    create: {
      id: 'brief_seed_003',
      brandManagerClerkId: 'test_brand_001',
      agencyClerkId: 'test_agency_001',
      title: 'Meal Prep Series Sponsorship',
      description: 'Partner with a food/lifestyle creator for a 4-part meal prep series. Content to run over 4 consecutive weeks.',
      budget: 200000,
      platform: 'TikTok',
      niche: 'Food',
      status: 'CONVERTED' as BriefStatus,
    },
  })
  console.log('✅ Briefs seeded')

  // ── Jordan Park doesn't have agencyClerkId — not rostered, available on /discover ──
  // (already seeded above with agencyClerkId: 'test_agency_001' — adjust for discovery demo)
  await db.creator.update({
    where: { id: jordan.id },
    data: { agencyClerkId: null },
  })

  console.log('🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
