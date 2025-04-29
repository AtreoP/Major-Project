/*window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
}

async function init() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById("video").srcObject = stream;
    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
}


function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org"
            }
        ]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);

    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = {
        sdp: peer.localDescription
    };

    const { data } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}*/
window.onload = () => {
    document.getElementById('my-button').onclick = () => {
        init();
    }
};

let stream;

async function init() {
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const videoElement = document.getElementById("video");
    videoElement.srcObject = stream;

    const peer = createPeer();
    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    
    startSendingFrames(videoElement);
}

function createPeer() {
    const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.stunprotocol.org" }]
    });
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(peer);
    return peer;
}

async function handleNegotiationNeededEvent(peer) {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const payload = { sdp: peer.localDescription };
    const { data } = await axios.post('/broadcast', payload);
    const desc = new RTCSessionDescription(data.sdp);
    peer.setRemoteDescription(desc).catch(e => console.log(e));
}

function startSendingFrames(videoElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    setInterval(() => {
        if (!videoElement.videoWidth) return;

        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        const imageBase64 = canvas.toDataURL('image/jpeg');
        sendToPython(imageBase64);
    }, 1000); 
}

function sendToPython(imageData) {
    fetch("http://localhost:5000/frame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData })
    }).catch(err => console.error("Failed to send frame:", err));
}


