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
var passingDataToModal = (param1, param2) => {
    modalBody = document.getElementById("modal_body");
    modalBody.innerHTML = `<p>${param1}</p><p>${param2}</p>`;
}


//=============================================================

var makeInputModal = () => {
    modalBody = document.getElementById("modal_body");
    modalBody.innerHTML =`<div class="container">
    <div>
        <input type="file" id="imageFileInput" accept=".jpg, .jpeg, .png" /> 
    </div>
    <div>
        <label for="title"><b>title</b></label>
        <div><input id="input_title" type="text" placeholder="write title" name="title" required></div>
    </div>
    <div>
        <label for="msg"><b>message</b></label>
        <div><input id="input_msg" type="text" placeholder="write message" name="msg" required></div>
    </div>
    <button type="submit">post</button>
    </div>`
}
//TODO:submit 함수 구현해야함. 
//TODO:thumbnail 보이게 하기.


var btn = document.getElementById("inputModal");
btn.onclick = () => {
    makeInputModal();
    modal.style.display = "block";
}
