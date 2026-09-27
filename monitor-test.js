const { chromium } = require('playwright');

const PRODUCTS = [
  {
    name: '0539 - Pokémon 30th Bundle 6 Buste IT',
    url: 'https://www.gamelife.it/ccpk0539-carte-pokemon-30th-bundle-6-buste-it?_gl=1*18egdzy*_up*MQ..*_ga*MTQxMzk1NDU1Ny4xNzkwNTM2Nzky*_ga_DH5MJC10GE*czE3OTA1Mzc0MDMyJG8kMDEkZzEkdDE3OTA1Mzc0MDMyJGowJGwwJGg0MTc1OTYxNQ..&attribute_values=4'
  }
];

(async () => {
  const browser = await chromium.launch({
    headless: true
  });

  try {
    const context = await browser.newContext({
      locale: 'it-IT',
      timezoneId: 'Europe/Rome',
      viewport: {
        width: 1365,
        height: 900
      }
    });

    for (const product of PRODUCTS) {
      console.log('\n========================================');
      console.log(product.name);
      console.log('========================================');

      const page = await context.newPage();

      try {
        const response = await page.goto(product.url, {
          waitUntil: 'domcontentloaded',
          timeout: 60000
        });

        console.log('HTTP status:', response ? response.status() : 'N/A');
        console.log('Final URL:', page.url());
        console.log('Title:', await page.title());

        await page.waitForTimeout(5000);

        const result = await page.evaluate(() => {
          const wrap = document.querySelector('#add_to_cart_wrap');
          const parent = wrap ? wrap.parentElement : null;

          const cloudflare =
            /Just a moment|cf_chl|__cf_chl|challenge-platform/i.test(
              document.documentElement?.outerHTML || ''
            );

          return {
            cloudflare,
            hasCartWrap: !!wrap,
            parentClass: parent ? parent.className : null,
            outOfStock: parent
              ? parent.classList.contains('out_of_stock')
              : false,
            addToCart: !!document.querySelector('#add_to_cart'),
            addToCartPreorder: !!document.querySelector('#add_to_cart_preorder')
          };
        });

        console.log('RISULTATO DETECTOR:');
        console.log(JSON.stringify(result, null, 2));

      } catch (error) {
        console.log('ERRORE DURANTE IL CARICAMENTO:');
        console.log(error.message);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
})();
