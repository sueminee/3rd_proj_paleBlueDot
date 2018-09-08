let dragging = false

$(function () {
  // we are modifying background
  const target = $('#background');

  // get window's width and height
  let width = window.innerWidth;
  let height = window.innerHeight;

  // adjust image's size and location
  const sizeImage = function () {
    target.css('height', Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));
    target.css('width', 'auto');
    target.css('top', target.height() / -2 + height / 2);
    target.css('left', target.width() / -2 + width / 2);
  }

  sizeImage();

  $(window).resize(function () {
    width = $(window).width();
    height = $(window).height();
    sizeImage();
  });


  // measure degree from the horizontal line to the mouse point.
  const measureDegree = function (e) {
    let x = e.pageX;
    let y = e.pageY;
    let radians = Math.atan2(x - width / 2, y - height / 2);
    return (radians * (180 / Math.PI) * -1) + 90;
  }

  // save the degree
  let alreadyRotated = 0;
  let fromDegree = 0;

  $(document).mousedown(function (e) {
    dragging = true
    fromDegree = measureDegree(e);
  })
  $(document).mouseup(function (e) {
    dragging = false
    alreadyRotated += measureDegree(e) - fromDegree;
  })
  $(document).mousemove(function (e) {
    if (dragging) {
      let nowDegree = measureDegree(e);
      target.css('-webkit-transform', 'rotate(' + (nowDegree - fromDegree + alreadyRotated) + 'deg)');
      target.css('-webkit-transform-origin', '50% 50%');
    }
  })
})