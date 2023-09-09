const root = document.getElementById("root");
const video = document.getElementById("webcam");
const liveView = document.getElementById("liveView");
const webcamAccessBtn = document.getElementById("webcam-btn");

let model;
async function loadModel() {
  model = await cocoSsd.load();
  root.classList.remove("blur");
}
loadModel();

function isGetUserMediaSupported() {
  !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

if (!isGetUserMediaSupported) {
  window.prompt("Sorry, Can't access you webcam");
}

webcamAccessBtn.addEventListener("click", accessWebCam);

async function accessWebCam() {
  if (!model) return;
  video.classList.remove("removed");
  webcamAccessBtn.classList.add("removed");

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });

  video.srcObject = stream;
  video.addEventListener("loadeddata", handleClassification);
}

let children = []
async function handleClassification() {
  const predictions = await model.detect(video);
  console.log(predictions);

  for(const child of children){
    liveView.removeChild(child)
  }
  children = [];

  for (const prediction of predictions) {
    if (prediction.score > 0.66) {
      const p = document.createElement("p");
      p.innerText = `${prediction.class}: ${Math.round(parseFloat(prediction.score) * 100)}% accuracy.`;     
       p.style = 
      'margin-left: ' + prediction.bbox[0] + 'px;\
       margin-top: '+ (prediction.bbox[1] - 10) + 'px;\
       width: ' + (prediction.bbox[2] - 10) + 'px;\
       top: 0;\
       left: 0;';

       const highlighter = document.createElement('div')
       highlighter.setAttribute('class', 'highlighter');
        highlighter.style = 
           'left: ' + prediction.bbox[0] + 'px;\
            top: '+ prediction.bbox[1] + 'px;\
            width: ' + prediction.bbox[2] + 'px;\
            height: ' + prediction.bbox[3] + 'px;';

        liveView.appendChild(highlighter)
        liveView.appendChild(p)
        children.push(highlighter, p)
    }
  }
  window.requestAnimationFrame(handleClassification)
}