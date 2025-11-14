const startButton = document.getElementById("start-scan")!;
const video = document.getElementById("scanner") as HTMLVideoElement;
const productInfo = document.getElementById("product-info")!;

declare class BarcodeDetector {
  constructor(options?: { formats?: string[] });
  detect(image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<{ rawValue: string }[]>;
}

let scanning = false;

// Fonction pour activer la caméra
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = stream;
    await video.play();
    scanning = true;
    scanFrame();
    console.log("Caméra activée !");
  } catch (err) {
    console.error("Impossible d'accéder à la caméra :", err);
  }
}

// Fonction pour scanner les codes-barres
async function scanFrame() {
  if (!scanning) return;

  // Vérifie que BarcodeDetector est disponible
  if (!('BarcodeDetector' in window)) {
    console.error("BarcodeDetector non supporté par ce navigateur !");
    return;
  }

  const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_e', 'upc_a'] });

  try {
    const barcodes = await detector.detect(video);
    if (barcodes.length > 0) {
      const code = barcodes[0].rawValue;
      console.log("Code détecté :", code);
      scanning = false;
      stopCamera();
      fetchProductInfo(code);
    } else {
      requestAnimationFrame(scanFrame); // Continuer à scanner
    }
  } catch (err) {
    console.error("Erreur lors du scan :", err);
    requestAnimationFrame(scanFrame);
  }
}

// Fonction pour arrêter la caméra
function stopCamera() {
  const stream = video.srcObject as MediaStream;
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  video.srcObject = null;
}

// Fonction pour récupérer les infos produit via OpenFoodFacts
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
    })
    .catch(err => {
      console.error("Erreur API :", err);
      productInfo.innerHTML = "<p>Erreur lors de la récupération des infos produit</p>";
    });
}

// Bouton pour démarrer la caméra
startButton.addEventListener("click", () => {
  if (!scanning) startCamera();
});
