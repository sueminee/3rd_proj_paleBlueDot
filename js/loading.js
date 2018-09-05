const onReady = (callback) => {
    var intervalId = window.setInterval(() => {
        if (document.getElementsByTagName('body')[0] !== undefined) {
            window.clearInterval(intervalId);
            callback.call(this);
        }
    }, 1000);
}


const setVisible = (selector, visible) => {
    document.querySelector(selector).style.display = visible ? 'block' : 'none';
}


onReady(() => {
    setVisible('.page', true);
    setVisible('#loading', false);
});