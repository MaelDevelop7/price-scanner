var video = document.getElementById("scanner");
var startButton = document.getElementById("start-scan");
var productInfo = document.getElementById("product-info");
startButton.addEventListener("click", function () {
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
    }, function (err) {
        if (err) {
            console.error(err);
            return;
        }
        Quagga.start();
    });
    Quagga.onDetected(function (data) {
        var code = data.codeResult.code;
        console.log("Code-barres détecté :", code);
        fetchProductInfo(code);
        Quagga.stop();
    });
});
// Exemple avec OpenFoodFacts
function fetchProductInfo(barcode) {
    fetch("https://world.openfoodfacts.org/api/v0/product/".concat(barcode, ".json"))
        .then(function (res) { return res.json(); })
        .then(function (data) {
        if (data.status === 1) {
            var product = data.product;
            productInfo.innerHTML = "\n          <h2>".concat(product.product_name, "</h2>\n          <img src=\"").concat(product.image_small_url, "\" alt=\"").concat(product.product_name, "\" />\n          <p>Marque : ").concat(product.brands, "</p>\n          <p>Cat\u00E9gorie : ").concat(product.categories, "</p>\n        ");
        }
        else {
            productInfo.innerHTML = "<p>Produit non trouvé</p>";
        }
    });
}
