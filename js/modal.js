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
        modalTitle.innerHTML = `<h3>${starName}</h3>`;
    
        modalBody = document.getElementById("modal_body");
        modalBody.innerHTML = `<p>이미지</p><p>메세지 : ${data.msg}</p><p>flag는 ${data.flag} 개</p><p>${data.createdAt}에 생성된 star</p>`;
    });
}


//=============================================================

var makeInputModal = () => {
    modalTitle = document.getElementById("headerH3");
    modalTitle.innerHTML = `<h3>Making new Star</h3>`;

    modalBody = document.getElementById("modal_body");
    modalBody.innerHTML = `
        <div class="container">
            <form action="http://52.78.57.243:5000/star" method="POST">
                <div>
                    <label for="image"><b>image</b></label>
                    <div><input type="file" id="image" name="image" accept=".jpg, .jpeg, .png" /> </div>
                </div>
                <div>
                    <label for="title"><b>title</b></label>
                    <div><input id="input_title" type="text" placeholder="제목을 입력해라" name="starName" onchange="inputChange(this.name, this.value)" required ></div>
                </div>
                <div>
                    <label for="msg"><b>message</b></label>
                    <div><input id="input_msg" type="text" placeholder="메세지를 입력해라" name="msg"  onchange="inputChange(this.name, this.value)" required></div>
                </div>
                <div>
                    <label for="tag"><b>tag</b></label>
                    <div><input id="input_tag" type="text" placeholder="태그를 입력하세요. 여러개일 경우 comma(,)로 구분해주세요. (예: 마라샹궈,건대맛집,허씨네)" name="asterisms"  onchange="inputChange(this.name, this.value)"></div>
                </div>
                <button type="submit" onClick="submitNewStar()">post</button>
            </form> 
        </div>   
        `;
}
//TODO:submit 함수 구현해야함. 
//TODO:thumbnail 보이게 하기.


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
    star[`${"name"}`] = `${value}`
    console.log(star)
}

var submitNewStar = () => {
    var payload = {
        star :star,
        asterisms: asterisms,
        img : null
    }
    console.log(payload)
    fetch('http://52.78.57.243:5000/star', {
        method : 'POST',
        headers: {
            'Accept' : 'application/json, text/plain, */*',
            'Access-Control-Allow-Origin': '*',
            'Content-Type' : 'application/json'
        },
        body:JSON.stringify(payload)
    })
    .then((res) => res.json())
    .then((data) => {
        console.log('submitNewStar POST 후 response로 받는 data : ', data)
    });
}