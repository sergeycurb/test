var serverEvents = new EventSource('/event-stream');
serverEvents.addEventListener('message', function(event){
    let div = document.createElement('div');
    div.innerHTML = event.data;
    document.getElementById('input').appendChild(div);
});

document.getElementById('close').addEventListener('click', (e) => {
    serverEvents.close();
});