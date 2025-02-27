const ws = new WebSocket("ws://localhost:3000");  // WebSocket connection

const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },  
    { urls: "turn:your-turn-server-ip:3478", username: "user", credential: "password" }
  ]
});

let localStream;
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

// Capture camera & microphone
async function startStreaming() {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  localVideo.srcObject = localStream;
  localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  ws.send(JSON.stringify({ offer }));
}

// Handle signaling messages
ws.onmessage = async (event) => {
  const message = JSON.parse(event.data);

  if (message.offer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    ws.send(JSON.stringify({ answer }));
  } else if (message.answer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(message.answer));
  } else if (message.candidate) {
    await peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
  }
};

// Send ICE candidates
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    ws.send(JSON.stringify({ candidate: event.candidate }));
  }
};

// Display remote stream
peerConnection.ontrack = (event) => {
  remoteVideo.srcObject = event.streams[0];
};
