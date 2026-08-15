import Link from 'next/link'
import BackButton from '@/components/BackButton'

export default function HelpPage() {
  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <BackButton href="/" />

        <h1 className="text-3xl font-bold mb-2">Help &amp; How-To</h1>
        <p className="text-gray-500 dark:text-stone-400 text-sm mb-8">Everything you can do in the Recipe App.</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Getting started</h2>
          <p className="text-gray-800 dark:text-stone-200">Sign in with your Google account. On iPhone, open in Safari, tap the Share button, then choose &quot;Add to Home Screen&quot; so it acts like a real app.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Browsing recipes</h2>
          <p className="text-gray-800 dark:text-stone-200">The home page shows every recipe you can see. Three ways to browse:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-800 dark:text-stone-200">
            <li><b>Category</b>: recipes grouped by Breakfast, Lunch, Dinner, Dessert, Snacks, Drinks.</li>
            <li><b>A–Z</b>: flat list sorted alphabetically by title.</li>
            <li><b>Recent</b>: newest first, with labels like &quot;Today&quot;, &quot;2 days ago&quot;.</li>
            <li><b>People</b>: pick anyone (including yourself) from the dropdown to see just their recipes.</li>
          </ul>
          <p className="mt-2 text-gray-800 dark:text-stone-200">The <b>search bar</b> filters by recipe name in any view. The <b>🎲 dice button</b> picks a random recipe (respects your search filter if one is active).</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Adding a recipe manually</h2>
          <ol className="list-decimal pl-5 space-y-1 text-gray-800 dark:text-stone-200">
            <li>Tap <b>+ Add Recipe</b>.</li>
            <li>Fill in title, category, ingredients (one per line), steps (one per line), and optional notes.</li>
            <li>Uncheck <b>Make this public</b> if you want the recipe kept private (only you can see it).</li>
            <li>Tap <b>Save Recipe</b>.</li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Scanning a recipe with AI</h2>
          <ol className="list-decimal pl-5 space-y-1 text-gray-800 dark:text-stone-200">
            <li>Tap <b>Scan Recipe</b>.</li>
            <li>Upload one or more images of the recipe (screenshots, photos of a cookbook, etc.). Multiple images from the same recipe get combined.</li>
            <li>Tap <b>Extract Recipe with AI</b> and wait 10-20 seconds.</li>
            <li>Review the pre-filled form. Fix anything the AI got wrong.</li>
            <li>Tap <b>Save Recipe</b>.</li>
          </ol>
          <p className="mt-2 text-gray-800 dark:text-stone-200 text-sm">Tip: clearer images give better results. Cropped screenshots work great. If a recipe spans multiple screens, upload all screenshots at once.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Sectioned ingredient lists</h2>
          <p className="text-gray-800 dark:text-stone-200">For recipes with multiple components (e.g., meatballs + sauce + toppings), split ingredients into sections by typing a line like this:</p>
          <pre className="bg-gray-100 rounded p-3 mt-2 text-sm overflow-x-auto">## Meatballs
1 lb ground beef
1 egg

## Tzatziki
1 cup Greek yogurt
1 cucumber, grated</pre>
          <p className="mt-2 text-gray-800 dark:text-stone-200">Rules: two pound signs, space, then the section name, on its own line. Every ingredient below becomes part of that section until the next <code>##</code>. Works when typing manually AND when scanning (the AI preserves sections it finds in the image).</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Cooking mode</h2>
          <p className="text-gray-800 dark:text-stone-200">Open any recipe and tap <b>Start cooking</b> to enter cooking mode:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-800 dark:text-stone-200">
            <li>Big, easy-to-read text for wet or floury hands.</li>
            <li>Tap ingredients to check them off as you use them (state stays until you leave the page).</li>
            <li>Screen stays awake automatically so it doesn&apos;t sleep on you mid-recipe.</li>
            <li>Tap <b>Exit cooking mode</b> at top or bottom to return to the normal recipe view.</li>
          </ul>
          <p className="mt-2 text-gray-800 dark:text-stone-200 text-sm">Note: screen wake requires iOS 16.4 or newer. If unsupported, cooking mode still works, the screen just doesn&apos;t stay on automatically.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Themes</h2>
          <p className="text-gray-800 dark:text-stone-200">Go to Profile (or /appearance) to pick from three color themes:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-800 dark:text-stone-200">
            <li><b>Ocean</b> — cool blue on cream (default)</li>
            <li><b>Warm Cream</b> — terracotta on cream, calming</li>
            <li><b>Deep</b> — Spotify-inspired green on charcoal</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Light &amp; dark mode</h2>
          <p className="text-gray-800 dark:text-stone-200">Tap the sun/moon icon in the top-right of the home page to switch between light and dark mode. Your choice is remembered on this device (each device is independent).</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Exporting a grocery list</h2>
          <p className="text-gray-800 dark:text-stone-200">Open any recipe and tap <b>Export list</b> next to the Ingredients heading. On iPhone this opens the Share sheet so you can send the ingredients straight to the Notes app, Messages, Mail, or anywhere else. On desktop it copies the list to your clipboard.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Editing a recipe</h2>
          <p className="text-gray-800 dark:text-stone-200">Open one of your own recipes, scroll to the bottom, tap <b>Edit this recipe</b>. Change anything and tap <b>Save Changes</b>. Tap <b>Cancel</b> to bail without saving.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Deleting a recipe</h2>
          <p className="text-gray-800 dark:text-stone-200">Open one of your own recipes, scroll to the bottom, tap <b>Delete this recipe</b> (in red). Confirm the popup. The recipe is permanently gone.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Editing your name</h2>
          <p className="text-gray-800 dark:text-stone-200">Tap <b>Profile</b> at the top of the home page. Change your display name and save. This is the name shown as the author on all your recipes.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Who can see what?</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-stone-200">
            <li><b>Public recipes</b>: anyone signed in can see them.</li>
            <li><b>Private recipes</b>: only you can see them.</li>
            <li><b>Editing/deleting</b>: only the person who added a recipe can change or remove it. Everyone else&apos;s recipes are read-only to you.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Sharing the app with someone</h2>
          <p className="text-gray-800 dark:text-stone-200">Send them the app URL. They&apos;ll need a Google account, and that account must be added as a test user by the app owner before they can sign in.</p>
          <p className="mt-2 text-gray-800 dark:text-stone-200 text-sm">First-time sign-in shows an &quot;unverified app&quot; warning from Google. Tap <b>Advanced</b>, then <b>Go to Recipe App (unsafe)</b>. This is normal for personal apps.</p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Signing out</h2>
          <p className="text-gray-800 dark:text-stone-200">Tap <b>Profile</b> at the top of the home page, then tap <b>Sign out</b> at the bottom of the Profile page.</p>
        </section>

        <p className="text-xs text-gray-400 dark:text-stone-500 mt-12">Last updated after adding the People tab.</p>
      </div>
    </div>
  )
}







