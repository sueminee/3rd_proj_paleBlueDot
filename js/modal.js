// Get the modal
var modal = document.getElementById('myModal');

// 모달창 닫는 버튼 (X)
var span = document.getElementById("modal_close");
// (X) 누르면 모달창 닫아라.
span.onclick = function() {
    modal.style.display = "none";
}
// 모달 밖에 아무데나 누르면 모달창 닫기
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var modalBody = null;
var modalTitle = null;
var passingDataToModal = (index, starName) => {
    // console.log(index,starName)
    fetch(`http://52.78.57.243:5000/star/${index}`)
    .then((res) => res.json())
    .then((data) => {
        console.log('star를 클릭하면 db에 요청하는 data_____________: ', data)

        modalTitle = document.getElementById("headerH3");
        modalTitle.innerHTML = `<h3>${data.starName}</h3>`;
    
        modalBody = document.getElementById("modal_body");
        modalBody.innerHTML = `
            <p>이미지</p>
            <p>메세지 : ${data.msg}</p>`;

        modalFoot = document.getElementById("createdAt");
        modalFoot.innerHTML = `<div class="box"><div>created at ${data.createdAt}</div><div><button id="flagButton" onclick="clickFlag(${data.id})">flag ${data.flag}</button></div></div>`;
    });
}

var clickFlag = (id, starName) => {
    console.log(id)
    fetch(`http://52.78.57.243:5000/flag/${id}`,{method: 'PUT'})
    .then((res) => {
        console.log(res)
        passingDataToModal(id, starName);
    })
}

if (window.FileReader) {
    var reader = new FileReader(), rFilter = /^(image\/bmp|image\/cis-cod|image\/gif|image\/ief|image\/jpeg|image\/jpeg|image\/jpeg|image\/pipeg|image\/png|image\/svg\+xml|image\/tiff|image\/x-cmu-raster|image\/x-cmx|image\/x-icon|image\/x-portable-anymap|image\/x-portable-bitmap|image\/x-portable-graymap|image\/x-portable-pixmap|image\/x-rgb|image\/x-xbitmap|image\/x-xpixmap|image\/x-xwindowdump)$/i; 
    reader.onload = function (oFREvent) { 
        preview = document.getElementById("preview")
        preview.src = oFREvent.target.result;  
        preview.style.display = "inline-block";
    };  
    function doTest() {
        if (document.getElementById("myfile").files.length === 0) { return; }  
        var file = document.getElementById("myfile").files[0];  
        if (!rFilter.test(file.type)) { alert("You must select a valid image file!"); return; }  
        reader.readAsDataURL(file); 
    }
} else {
    alert("FileReader object not found :( \nTry using Chrome, Firefox or WebKit");
}


//=============================================================

var makeInputModal = () => {
    modalTitle = document.getElementById("headerH3");
    modalTitle.innerHTML = `<h3>Making A New Star</h3>`;

    modalBody = document.getElementById("modal_body");

    modalBody.innerHTML = `
        <div class="container">
            <form id="formTag" target="_blank">
                <div class="inputBox">
                    <label for="image"><b>image &emsp;</b></label><input type="file" id="myfile" class="hidden" name="myfile" size="30" onchange="doTest()">
                    <div class="preview">
                    <img id="preview" src="" style="display:none" />
                    </div>
                </div>
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
                    <div><input id="input_tag" type="text" placeholder="태그를 입력하세요. 여러개일 경우 comma(,)로 구분해주세요. (예: 마라샹궈,건대맛집,허씨네)" name="asterisms"  onchange="inputChange(this.name, this.value)"></div>
                </div>
                <div class="inputBox"><button type="submit" onClick="submitNewStar()">post</button></div>
            </form> 
        </div>   
        `;

    modalFoot = document.getElementById("createdAt");
    modalFoot.innerHTML = `<div class="box"></div>`;
}

var btn = document.getElementById("createStar");
btn.onclick = () => {
    makeInputModal();
    modal.style.display = "block";
}

var star = {
    "starName": null,
    "imgName": null,
    "msg": null
}
var asterisms = [{asterismName:"태그1"}, {asterismName:"태그2"}, {asterismName:"태그3"}]
var asterismsssssssss = '태그1,태그2,태그3';


inputChange = (name, value) => {
    star[`${name}`] = `${value}`
    console.log(star)
}

var submitNewStar = () => {
    var payload = {
        star :star,
        asterisms: asterisms,
        img : null
    }
    console.log(payload)

    var formTag = document.getElementById("formTag");
    console.log(formTag)

//     fetch('http://52.78.57.243:5000/star', {
    //     fetch("https:// jsonplaceholder.typicode.com/posts", {
    //     method : 'POST',
    //     headers: {
    //         'Accept' : 'application/json, text/plain, */*',
    //         'Access-Control-Allow-Origin': '*',
    //         'Content-Type' : 'application/json'
    //     },
    //     body:JSON.stringify(payload)
    // })
    // .then((res) => res.json())
    // .then((data) => {
    //     console.log('submitNewStar POST 후 response로 받는 data : ', data)
    // });
}