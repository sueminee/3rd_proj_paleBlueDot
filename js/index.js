
var container = document.getElementById('container');

for (var i = 1; i<=5; i++) {
  var img = document.createElement('img');
  var src = `./img/img${i}.jpg`;
  // index.html 의 위치에서 봤을때의 상대경로를 입력해야함.
  // var src = 'https://images.unsplash.com/photo-1520034475321-cbe63696469a?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=2efbd126389f0ea2ce0db8c507919e1b&auto=format&fit=crop&w=1950&q=80';
  img.src = src;
  container.appendChild(img);
}

var cloneImg1 = document.images[0].cloneNode(false);
var cloneImg2c1 = document.images[1].cloneNode(false);
var cloneImg2c2 = document.images[1].cloneNode(false);
var cloneImg3c1 = document.images[2].cloneNode(false);
var cloneImg3c2 = document.images[2].cloneNode(false);
var cloneImg4c1 = document.images[3].cloneNode(false);
var cloneImg4c2 = document.images[3].cloneNode(false);
var cloneImg5 = document.images[4].cloneNode(false);

container.insertBefore(cloneImg5, document.images[0]);
container.insertBefore(cloneImg4c1, document.images[0]);
container.insertBefore(cloneImg3c1, document.images[0]);
container.insertBefore(cloneImg2c1, document.images[0]);
container.appendChild(cloneImg1);
container.appendChild(cloneImg2c2);
container.appendChild(cloneImg3c2);
container.appendChild(cloneImg4c2);

var sliderStartForward = document.images[4].getBoundingClientRect().left;
var sliderEndForward = document.images[8].getBoundingClientRect().right - 10;
var sliderStartBackward = document.images[4].getBoundingClientRect().right;

container.scrollLeft = sliderStartForward;

container.addEventListener('scroll', scrolling);

function scrolling() {  
  if (container.scrollLeft < 1) {
    container.scrollLeft = sliderStartBackward;
  } 
  
  if (container.scrollLeft > sliderEndForward) {
    container.scrollLeft = sliderStartForward;
  }
}