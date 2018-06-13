const medias1 = {
  audio: false,
  video: {
    facingMode: "user"
  }
};
const medias2 = {
  audio: false,
  video: {
    facingMode: {
      exact: "environment"
    }
  }
};
const start1 = document.getElementById("start1");
const start2 = document.getElementById("start2");
const stop = document.getElementById("stop");
const video = document.getElementById("video");
const capture = document.getElementById("capture");
const canvas = document.getElementById("canvas");
const decode1 = document.getElementById("decode1");
const decode2 = document.getElementById("decode2");
const loop1 = document.getElementById("loop1");
const loop2 = document.getElementById("loop2");
const image1 = document.getElementById("image1");
const image2 = document.getElementById("image2");
const result = document.getElementById("result");

// logic
const captureVideo = function () {
  if (!video.srcObject) {
    return;
  }
  const context = canvas.getContext("2d");
  // const w = video.offsetWidth;
  // const h = video.offsetHeight;
  const w = video.videoWidth;
  const h = video.videoHeight;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = w;
  canvas.height = h;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
};

const successCallback = function (stream) {
  video.srcObject = stream;
};

const errorCallback = function (err) {
  alert(err);
};

const imageToCanvas = function (image) {
  const context = canvas.getContext("2d");
  const w = image.width;
  const h = image.height;
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  canvas.width = w;
  canvas.height = h;
  context.drawImage(image, 0, 0, w, h);
};

const showPicture = document.createElement("img");
showPicture.onload = function (event) {
  JOB.DecodeImage(showPicture);
}

let job_decode_result = null;
JOB.Init();
JOB.SetImageCallback(function (ret) {
  if (job_decode_result) {
    return true;
  }
  if (ret.length > 0) {
    var tempArray = [];
    for (var i = 0; i < ret.length; i++) {
      tempArray.push(ret[i].Format + " : " + ret[i].Value);
    }
    result.innerHTML = tempArray.join("<br />");
    job_decode_result = true;
  } else {
    if (ret.length === 0) {
      result.innerHTML = "Decoding failed.";
      job_decode_result = false;
    }
  }
});

const decode_JOB = function () {
  if (job_decode_result) {
    return true;
  }
  result.innerHTML = "";
  const base64 = canvas.toDataURL();
  showPicture.src = base64;
};

let jsq_decode_result = null;
const decode_jsqrcode = function () {
  if (jsq_decode_result) {
    return true;
  }
  result.innerHTML = "";
  const base64 = canvas.toDataURL();
  qrcode.callback = function (res) {
    if (jsq_decode_result) {
      return true;
    }
    if (res instanceof Error) {
      result.innerText = "No QR code found.";
      jsq_decode_result = false;
    } else {
      result.innerText = res;
      console.log(res);
      jsq_decode_result = true;
    }
  };
  qrcode.decode(base64);
};

// bind event
start1.addEventListener("click", function () {
  navigator.getUserMedia(medias1, successCallback, errorCallback);
});

start2.addEventListener("click", function () {
  navigator.getUserMedia(medias2, successCallback, errorCallback);
});

stop.addEventListener("click", function () {
  const stream = video.srcObject;
  if (!stream) {
    return;
  }
  const tracks = stream.getTracks();
  tracks.forEach(function (track) {
    track.stop();
  });
  video.srcObject = null;
});

capture.addEventListener("click", function () {
  captureVideo();
});

image1.addEventListener("click", function () {
  imageToCanvas(image1);
});

image2.addEventListener("click", function () {
  imageToCanvas(image2);
});

decode1.addEventListener("click", function () {
  job_decode_result = null;
  decode_JOB();
});

decode2.addEventListener("click", function () {
  jsq_decode_result = null;
  decode_jsqrcode();
});

loop1.addEventListener("click", function () {
  job_decode_result = null;
  let n = 0;
  const f = function () {
    if (!video.srcObject) {
      return;
    }
    if (job_decode_result) {
      return;
    }
    if (n > 100) {
      return;
    }
    captureVideo();
    if (decode_JOB()) {
      return;
    }
    setTimeout(f, 200);
    ++n;
  };
  f();
});

loop2.addEventListener("click", function () {
  jsq_decode_result = null;
  let n = 0;
  const f = function () {
    if (!video.srcObject) {
      return;
    }
    if (jsq_decode_result) {
      return;
    }
    if (n > 100) {
      return;
    }
    captureVideo();
    if (decode_jsqrcode()) {
      return;
    }
    setTimeout(f, 200);
    ++n;
  };
  f();
});
