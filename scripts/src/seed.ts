import { db } from "@workspace/db";
import { problemsTable, testCasesTable } from "@workspace/db/schema";

const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    topic: "Arrays",
    tags: ["Array", "Hash Table"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have **exactly one solution**, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: `- 2 <= nums.length <= 10^4
- -10^9 <= nums[i] <= 10^9
- -10^9 <= target <= 10^9
- Only one valid answer exists.`,
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]" },
    ],
    starterCodePython: `def twoSum(nums: list[int], target: int) -> list[int]:
    # Your code here
    pass

# Read input
import sys
data = sys.stdin.read().split()
n = int(data[0])
nums = list(map(int, data[1:n+1]))
target = int(data[n+1])
print(twoSum(nums, target))
`,
    starterCodeJavascript: `function twoSum(nums, target) {
    // Your code here
}

const lines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\\n');
const [n, ...rest] = lines[0].split(' ').map(Number);
const nums = rest.slice(0, n);
const target = rest[n];
console.log(JSON.stringify(twoSum(nums, target)));
`,
    acceptanceRate: 49.2,
  },
  {
    title: "Valid Palindrome",
    slug: "valid-palindrome",
    difficulty: "Easy",
    topic: "Strings",
    tags: ["String", "Two Pointers"],
    description: `A phrase is a **palindrome** if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string \`s\`, return \`true\` *if it is a palindrome, or* \`false\` *otherwise*.`,
    constraints: `- 1 <= s.length <= 2 * 10^5
- s consists only of printable ASCII characters.`,
    examples: [
      { input: 'A man, a plan, a canal: Panama', output: "true", explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: "race a car", output: "false", explanation: '"raceacar" is not a palindrome.' },
      { input: " ", output: "true", explanation: 's is an empty string "" after removing non-alphanumeric characters. An empty string reads the same forward and backward.' },
    ],
    starterCodePython: `def is_palindrome(s: str) -> bool:
    # Your code here
    pass

import sys
s = sys.stdin.read().strip()
print(is_palindrome(s))
`,
    starterCodeJavascript: `function isPalindrome(s) {
    // Your code here
}

const s = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
console.log(isPalindrome(s));
`,
    acceptanceRate: 44.1,
  },
  {
    title: "Climbing Stairs",
    slug: "climbing-stairs",
    difficulty: "Easy",
    topic: "Dynamic Programming",
    tags: ["Dynamic Programming", "Math", "Memoization"],
    description: `You are climbing a staircase. It takes \`n\` steps to reach the top.

Each time you can either climb \`1\` or \`2\` steps. In how many distinct ways can you climb to the top?`,
    constraints: `- 1 <= n <= 45`,
    examples: [
      { input: "2", output: "2", explanation: "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps" },
      { input: "3", output: "3", explanation: "There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step" },
    ],
    starterCodePython: `def climb_stairs(n: int) -> int:
    # Your code here
    pass

import sys
n = int(sys.stdin.read().strip())
print(climb_stairs(n))
`,
    starterCodeJavascript: `function climbStairs(n) {
    // Your code here
}

const n = parseInt(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
console.log(climbStairs(n));
`,
    acceptanceRate: 51.8,
  },
];

const testCaseData = [
  // Two Sum
  {
    slug: "two-sum",
    cases: [
      { input: "4 2 7 11 15 9", expectedOutput: "[0, 1]", isHidden: false },
      { input: "3 3 2 4 6", expectedOutput: "[1, 2]", isHidden: false },
      { input: "2 3 3 6", expectedOutput: "[0, 1]", isHidden: true },
      { input: "5 1 5 3 2 4 8", expectedOutput: "[2, 4]", isHidden: true },
    ],
  },
  // Valid Palindrome
  {
    slug: "valid-palindrome",
    cases: [
      { input: "A man, a plan, a canal: Panama", expectedOutput: "True", isHidden: false },
      { input: "race a car", expectedOutput: "False", isHidden: false },
      { input: " ", expectedOutput: "True", isHidden: true },
      { input: "Was it a car or a cat I saw?", expectedOutput: "True", isHidden: true },
    ],
  },
  // Climbing Stairs
  {
    slug: "climbing-stairs",
    cases: [
      { input: "2", expectedOutput: "2", isHidden: false },
      { input: "3", expectedOutput: "3", isHidden: false },
      { input: "5", expectedOutput: "8", isHidden: true },
      { input: "10", expectedOutput: "89", isHidden: true },
    ],
  },
];

async function seed() {
  console.log("Seeding problems...");

  for (const p of problems) {
    const existing = await db.select().from(problemsTable);
    const alreadyExists = existing.find((e) => e.slug === p.slug);
    if (alreadyExists) {
      console.log(`Problem "${p.title}" already exists, skipping.`);
      continue;
    }

    const [inserted] = await db.insert(problemsTable).values(p).returning();
    console.log(`Inserted problem: ${inserted.title} (id: ${inserted.id})`);

    const tcData = testCaseData.find((t) => t.slug === p.slug);
    if (tcData) {
      for (const tc of tcData.cases) {
        await db.insert(testCasesTable).values({
          problemId: inserted.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
        });
      }
      console.log(`  Inserted ${tcData.cases.length} test cases`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
