const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const reflectionCanvas = document.getElementById('reflection');
const bgColorInput = document.getElementById('bgColor');
const ctx = canvas.getContext('2d');
const reflectionCtx = reflectionCanvas.getContext('2d');

uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    canvas.width = img.width;
    canvas.height = img.height;
    reflectionCanvas.width = img.width;
    reflectionCanvas.height = img.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    const net = await bodyPix.load();
    const segmentation = await net.segmentPerson(canvas);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newImageData = ctx.createImageData(canvas.width, canvas.height);

    for (let i = 0; i < segmentation.data.length; i++) {
      const offset = i * 4;
      if (segmentation.data[i] === 1) {
        newImageData.data[offset] = imageData.data[offset];
        newImageData.data[offset + 1] = imageData.data[offset + 1];
        newImageData.data[offset + 2] = imageData.data[offset + 2];
        newImageData.data[offset + 3] = 255;
      } else {
        newImageData.data[offset + 3] = 0;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColorInput.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.putImageData(newImageData, 0, 0);

    reflectionCtx.clearRect(0, 0, reflectionCanvas.width, reflectionCanvas.height);
    reflectionCtx.fillStyle = bgColorInput.value;
    reflectionCtx.fillRect(0, 0, reflectionCanvas.width, reflectionCanvas.height);
    reflectionCtx.putImageData(newImageData, 0, 0);
  };
});
