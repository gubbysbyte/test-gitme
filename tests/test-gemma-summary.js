const { summarizeCommit } = require('../src/services/aiService');

async function testGemmaSummary() {
    console.log("🚀 Testing Gemma Summary Generation...");
    console.log("---------------------------------------");

    const mockCommitMessage = "feat: implement dark mode toggle and persist user preference";
    const mockDiff = `
diff --git a/src/components/ThemeToggle.js b/src/components/ThemeToggle.js
index 1234567..890abcd 100644
--- a/src/components/ThemeToggle.js
+++ b/src/components/ThemeToggle.js
@@ -1,5 +1,10 @@
-export const ThemeToggle = () => {
-  return <button>Toggle</button>
+export const ThemeToggle = ({ theme, toggle }) => {
+  return (
+    <button onClick={toggle}>
+      Current Theme: {theme}
+    </button>
+  );
 };
    `;

    console.log(`📝 Mock Commit Message: "${mockCommitMessage}"`);
    console.log("⏳ Requesting summary from LM Studio (Gemma)...");

    try {
        const summary = await summarizeCommit(mockCommitMessage, mockDiff);
        console.log("\n✅ Summary Generated Successfully:");
        console.log("---------------------------------------");
        console.log(summary);
        console.log("---------------------------------------");
    } catch (error) {
        console.error("\n❌ Error during test:");
        console.error(error.message);
        console.log("\n💡 Make sure LM Studio is running and the model is loaded!");
    }
}

testGemmaSummary();
