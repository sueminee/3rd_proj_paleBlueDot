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
document.onkeydown = function(evt) {
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
  function doTest() {
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

const getAsterisms = async (asterisms) => {
  let tags = await Promise.all(asterisms.map(async asterism => {
    const res = await fetch(`http://52.78.57.243:5000/asterism/${asterism}`)
    const data = await res.json();
    console.log('fetch하고 json 한 date', data)
    return '#' +data.asterismName;
    }));  
  console.log(tags);
  return tags;
}

const passingDataToModal = async (starId, asterisms) => {

  await fetch(`http://52.78.57.243:5000/star/${starId}`)
    .then((res) => res.json())
    .then((data) => {
      console.log('star를 클릭하면 db에 요청하는 data_____________: ', data)
      
      modalTitle = document.getElementById("modal_starname");
      modalTitle.innerHTML = `<p>${data.starName}</p>`;

      modalImg = document.getElementById("modal_img");
      modalImg.innerHTML = `
        <div>
          <img src="http://52.78.57.243:5000/${data.imgName}" height="auto" width="100%"/>
        </div>`;

      modalMsg = document.getElementById("modal_msg");
      modalMsg.innerHTML = `
        <div id="msg_tag">
          <p>${data.msg}</p>
        </div>`;

      modalFoot = document.getElementById("modal_createdAt");
      modalFoot.innerHTML = `<div class="box"><div>created at ${data.createdAt}</div><div><button id="flagButton" onclick="clickFlag(${data.id})">flag ${data.flag}</button></div></div>`;
    })

    const tags = await getAsterisms(asterisms);
    const a = tags.join(' ');
    console.log(a)
    $("#modal_msg").append(`<p>${a}</p>`);
}



const clickFlag = (id, starName) => {
  console.log(id)
  fetch(`http://52.78.57.243:5000/flag/${id}`, { method: 'PUT' })
    .then((res) => {
      console.log(res)
      passingDataToModal(id, starName);
    })
}

const makeInputModal = () => {
    modalBody = document.getElementById("modal_body");
    modalBody.innerHTML = `
        <div class="container">
            <div class="inputBox">
                <div>
                    <label for="image"><b>image &emsp;</b></label>
                    <input type="file" id="myfile" capture class="hidden" name="img" size="30" onchange="uploadImg(this.name, this.value)">
                    <div class="preview">
                        <img id="preview" src="" style="display:none" />
                    </div>
                </div>
            </div>
            <div>
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
                <div class="inputBox">
                    <button type="submit" onClick="submitNewStar()">post</button>
                </div>
            </div>
        </div>
        `;

  modalFoot = document.getElementById("modal_createdAt");
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
  console.log(formData.get(`${name}`))
}

const uploadImg = (name, value) => {
  doTest();
  formData.append(`${name}`, document.getElementById('myfile').files[0])
  console.log(formData.get(`${name}`))
}

const submitNewStar = () => {
  axios
    .post('http://52.78.57.243:5000/star', formData)
    .then(res => window.location.reload())
}
