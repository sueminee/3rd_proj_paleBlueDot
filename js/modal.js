// Get the modal
const modal = document.getElementById('modal');
// 모달창 닫는 버튼 (X)
const span = document.getElementById("modal_close");
// (X) 누르면 모달창 닫아라.
span.onclick = function () {
  modal.style.display = "none";
}
// 모달 밖에 아무데나 누르면 모달창 닫기
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// esc키 누르면 모달창 닫기
document.onkeydown = function (evt) {
  evt = evt || window.event;
  if (evt.keyCode == 27) {
    modal.style.display = "none";
  }
};

let preview = null;
if (window.FileReader) {
  const reader = new FileReader(), rFilter = /^(image\/bmp|image\/cis-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x-cmu-raster|image\/x-cmx|image\/x-icon|image\/x-portable-anymap|image\/x-portable-bitmap|image\/x-portable-graymap|image\/x-portable-pixmap|image\/x-rgb|image\/x-xbitmap|image\/x-xpixmap|image\/x-xwindowdump)$/i;
  reader.onload = function (oFREvent) {
    preview = document.getElementById("preview")
    preview.src = oFREvent.target.result;
    preview.style.display = "inline-block";
  };
  doTest = () => {
    if (document.getElementById("myfile").files.length === 0) { return; }
    const file = document.getElementById("myfile").files[0];
    if (!rFilter.test(file.type)) { alert("You must select a valid image file!"); return; }
    reader.readAsDataURL(file);
  }
} else {
  alert("FileReader object not found :( \nTry using Chrome, Firefox or WebKit");
}

let modalBody = null;
let modalTitle = null;
let modalFoot = null;

const getAsterisms = async asterisms => {
  let tags = await Promise.all(asterisms.map(async asterism => {
    const res = await fetch(`http://52.78.57.243:5000/asterism/${asterism}`)
    const data = await res.json();
    return '#' + data.asterismName;
  }));
  return tags;
}

const passingDataToModal = async (starId, asterisms) => {
  const res = await fetch(`http://52.78.57.243:5000/star/${starId}`);
  const data = await res.json();

  modalTitle = document.getElementById("modal_starname");
  modalTitle.innerHTML = `<h3>${data.starName}</h3>`;

  modalImg = document.getElementById("modal_img");
  console.log(modalImg);
  modalImg.innerHTML = `
    <div>
      <img src="http://52.78.57.243:5000/${data.imgName}" height="auto" width="100%"/>
    </div>`;

  modalMsg = document.getElementById("modal_msg");
  modalMsg.innerHTML = `
    <div id="modal_msg" style="overflow:scroll; height:300px;">
      <p class="no_margin_p">${data.msg}</p>
    </div>`;

  modalFoot = document.getElementById("modal_footer");
  modalFoot.innerHTML = `
    <div class="box">
      <div>created at ${data.createdAt}</div>
      <div>
        <button id="flagButton" onclick="clickFlag(${data.id}, ${data.asterisms})">flag ${data.flag}</button>
      </div>
    </div>`;

  const tags = await getAsterisms(asterisms);
  const a = tags.join(' ');
  $("#modal_msg").append(`<div id="modal_asterisms"><p class="no_margin_p">${a}</p></div>`);
}

const clickFlag = async (id) => {
  await fetch(`http://52.78.57.243:5000/flag/${id}`, { method: 'PUT' });
  const data = await fetch(`http://52.78.57.243:5000/star/${id}`, { method: 'GET' });
  const json = await data.json();
  $("#flagButton").text("flag " + json.flag);
}

const makeInputModal = () => {
  modalTitle = document.getElementById("modal_starname");
  modalTitle.innerHTML = `<h3>Create a New Star</h3>`;

  modalImg = document.getElementById("modal_img");
  // console.log(modalImg);
  modalImg.innerHTML = `
    <div class="inputBox">
      <label for="image"><b>image &emsp;</b></label>
      <input type="file" id="myfile" capture class="hidden" name="img" size="30" onchange="uploadImg(this.name, this.value)">
      <div class="preview">
        <img id="preview" src="" style="display:none" />
      </div>
    </div>`;

  modalMsg = document.getElementById("modal_msg");
  modalMsg.innerHTML = `
    <div class="inputBox">
      <label for="title"><b>title</b></label>
      <div><input id="input_title" type="text" placeholder="제목을 입력해라" name="starName" onchange="inputChange(this.name, this.value)" required ></div>
    </div>
    <div class="inputBox">
      <label for="msg"><b>message</b></label>
      <div><textarea id="input_msg" placeholder="메세지를 입력해라" name="msg"  onchange="inputChange(this.name, this.value)" required></textarea></div>
    </div>
    <div class="inputBox">
      <label for="tag"><b>tag</b></label>
      <div><input id="input_tag" type="text" placeholder="태그를 입력하세요. 여러개일 경우 띄어쓰기로 구분해주세요. (예: 마라샹궈 건대맛집 허씨네)" name="asterisms"  onchange="inputChange(this.name, this.value)"></div>
      </div>
    <div class="postbutton">
      <button type="submit" onClick="submitNewStar()">post</button>
    </div>`;

  modalFoot = document.getElementById("modal_footer");
  modalFoot.innerHTML = `<div class="box"></div>`;
}

// create new star 버튼입니다
const btn = $("#createStar");
// 마우스가 호버 되면 색이 변합니다
btn.hover(() => { btn.css('background-color', '#616183'); }, () => { btn.css('background-color', '#45425c'); })
// 클릭하면 모달창을 띄웁니다
btn.on('click', () => {
  makeInputModal();
  modal.style.display = "block";
})

const formData = new FormData();
const inputChange = (name, value) => {
  formData.append(`${name}`, `${value}`)
}

const uploadImg = (name, value) => {
  doTest();
  formData.append(`${name}`, document.getElementById('myfile').files[0])
}

const submitNewStar = async () => {
  await axios.post('http://52.78.57.243:5000/star', formData);
  window.location.reload()
}
