const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const dummyNames = [
  { name: "悪質 太郎", kana: "アクシツ タロウ", gender: "male" },
  { name: "無断 次郎", kana: "ムダン ジロウ", gender: "male" },
  { name: "暴言 花子", kana: "ボウゲン ハナコ", gender: "female" },
  { name: "未払 三郎", kana: "ミハライ サブロウ", gender: "male" },
  { name: "クレーマー 一子", kana: "クレーマー イチコ", gender: "female" },
  { name: "恫喝 四郎", kana: "ドウカツ シロウ", gender: "male" },
  { name: "音信 不通", kana: "オンシン フツウ", gender: "other" },
  { name: "虚偽 申告", kana: "キョギ シンコク", gender: "other" }
];

const dummyCities = ["東京都", "大阪府", "愛知県", "福岡県", "北海道", "神奈川県", "埼玉県", "千葉県"];

const dummyReasons = [
  "再三の連絡にも関わらず、支払いに応じない。着信拒否されている。",
  "無断キャンセル後、連絡が取れなくなった。同様の被害が他店でもあるとのこと。",
  "スタッフに対して大声で怒鳴り、営業妨害を行ったため。警察にも相談済み。",
  "契約内容にない不当な要求を繰り返し、業務に支障をきたした。",
  "提出された身分証明書が偽造であることが判明したため。"
];

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomDateStr = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
};

async function deleteTestCases() {
  console.log("Deleting all cases created by test users...");
  // Fetch test users
  const { data: testUsers, error: fetchError } = await supabase
    .from('app_users')
    .select('id')
    .like('display_name', 'テスト太郎%');

  if (fetchError) {
    console.error("Error fetching test users:", fetchError);
    return;
  }

  if (!testUsers || testUsers.length === 0) {
    console.log("No test users found.");
    return;
  }

  const testUserIds = testUsers.map(u => u.id);

  const { error: deleteError } = await supabase
    .from('blacklist_cases')
    .delete()
    .in('registered_by_user_id', testUserIds);

  if (deleteError) {
    console.error("Error deleting test cases:", deleteError);
  } else {
    console.log("Successfully deleted test cases.");
  }
}

async function createTestCases() {
  console.log("Starting dummy cases generation...");

  // 1. Fetch test users who are approved
  const { data: testUsers, error: userError } = await supabase
    .from('app_users')
    .select('id, company_id')
    .eq('is_approved', true)
    .like('display_name', 'テスト太郎%');

  if (userError) {
    console.error("Failed to fetch test users:", userError);
    return;
  }

  if (!testUsers || testUsers.length === 0) {
    console.log("No approved test users found. Please create and approve test users first.");
    return;
  }

  // 2. Group by company to ensure each company gets a few cases
  const companyUserMap = {};
  for (const user of testUsers) {
    if (!companyUserMap[user.company_id]) {
      companyUserMap[user.company_id] = [];
    }
    companyUserMap[user.company_id].push(user.id);
  }

  const casesToInsert = [];
  let totalGenerated = 0;

  for (const companyId of Object.keys(companyUserMap)) {
    const usersInCompany = companyUserMap[companyId];
    // Create 3 to 5 cases per company
    const numCases = randomInt(3, 5);

    for (let i = 0; i < numCases; i++) {
      const selectedUserId = randomElement(usersInCompany);
      const person = randomElement(dummyNames);
      const isApproved = Math.random() < 0.8; // 80% chance of being approved

      casesToInsert.push({
        registered_company_id: companyId,
        full_name: person.name,
        full_name_kana: person.kana,
        gender: person.gender,
        birth_date: randomDateStr(new Date(1960, 0, 1), new Date(2005, 0, 1)),
        phone_last4: String(randomInt(0, 9999)).padStart(4, '0'),
        city: randomElement(dummyCities),
        occurrence_date: randomDateStr(new Date(2025, 0, 1), new Date()),
        reason_text: randomElement(dummyReasons),
        status: isApproved ? 'approved' : 'pending',
        registered_by_user_id: selectedUserId,
        evidence_urls: []
      });
      totalGenerated++;
    }
  }

  console.log(`Prepared ${totalGenerated} cases. Inserting...`);

  const { error: insertError } = await supabase
    .from('blacklist_cases')
    .insert(casesToInsert);

  if (insertError) {
    console.error("Failed to insert dummy cases:", insertError);
  } else {
    console.log(`Successfully inserted ${totalGenerated} dummy cases!`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--delete')) {
    await deleteTestCases();
  } else {
    await createTestCases();
  }
}

main().catch(console.error);
