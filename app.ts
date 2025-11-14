// On dit à TypeScript que Quagga existe, pas besoin de types npm
declare const Quagga: any;

const video = document.getElementById("scanner") as HTMLVideoElement;
const startButton = document.getElementById("start-scan")!;
const productInfo = document.getElementById("product-info")!;

startButton.addEventListener("click", () => {
  Quagga.init({
    inputStream: {
      type: "LiveStream",
      target: video,
      constraints: {
        facingMode: "environment"
      }
    },
    decoder: {
      readers: ["ean_reader"]
    }
  }, (err: any) => {
    if (err) {
      console.error(err);
      return;
    }
    Quagga.start();
  });

  Quagga.onDetected((data: any) => {
    const code = data.codeResult.code;
    console.log("Code-barres détecté :", code);
    fetchProductInfo(code);
    Quagga.stop();
  });
});

// Exemple avec OpenFoodFacts
function fetchProductInfo(barcode: string) {
  fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    .then(res => res.json())
    .then(data => {
      if (data.status === 1) {
        const product = data.product;
        productInfo.innerHTML = `
          <h2>${product.product_name}</h2>
          <img src="${product.image_small_url}" alt="${product.product_name}" />
          <p>Marque : ${product.brands}</p>
          <p>Catégorie : ${product.categories}</p>
        `;
      } else {
        productInfo.innerHTML = "<p>Produit non trouvé</p>";
      }
    });
}
