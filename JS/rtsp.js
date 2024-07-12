function p1() {
    $('#mediadiv').html("<video controls id='video' autoplay></video>");
    $('#mediadiv').attr("class","col ratio ratio-16x9")

    if ($crar.val() == '0') {

    } else {
        $.LoadingOverlay("show");
        startDate = moment();;
        撥放摄影機();
        $('#ttime').val("")
    }


}

function p4(){

    //
    var start = $("#攝影主機 option:selected").index();
    var html="<div class=\"owl-carousel owl-theme\">";
    for(var i=1;i<33;i++){
        var k = '';
        for (j = 1; j < i; j++) {
            k = k + '0';
        }

        html=html+"<div class='item'><img  src='http://c1b69b2.i-dvr.net:"+dvrs[parseInt(start)].對外PORT+"/cgi-bin/net_jpeg.cgi?push=1&ch="+parseInt(('1' + k).padStart(44, '0'),2)+"'></div>";
    }
    html = html+"</div>";
    $('#mediadiv').html("<img  src='http://c1b69b2.i-dvr.net:"+dvrs[parseInt(start)].對外PORT+"/cgi-bin/net_jpeg.cgi?push=1&ch="+parseInt($("#crar option:selected").attr("data-type"),2)+"'>");
    //$('#mediadiv').html(html);
    //$('#mediadiv').attr("class","col")
    /*
    $('.owl-carousel').owlCarousel({
        loop:true,
        margin:10,
        nav:true,
        responsive:{
            0:{
                items:1
            },
            600:{
                items:3
            },
            1000:{
                items:5
            }
        }
    })

     */

}

function p3(){
    $('#mediadiv').html("<video controls id='video' autoplay></video>");
    startDate = moment();;
    var arr = $('#crar option')
    console.log(arr.length);
    var i=1;
    document.getElementById("crar").selectedIndex=0
    撥放摄影機();
    setInterval(function (){
        //console.log(arr[i]);
        startDate = moment();;
        document.getElementById("crar").selectedIndex=i;
        撥放摄影機();
        i++;
        console.log(i);
        if(i>=arr.length)
            i=0;
    },30000)
}

function p2() {
    if (new Date($('#ttime').val()).getTime() < new Date().getTime()) {
            $.LoadingOverlay("show");
            startDate = moment();;
            撥放摄影機(new Date($('#ttime').val()));
        } else {
            alert("不可大於現在!");
        }
}

function isMobileDevice() {
    let mobileDevices = ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone']
    for (var i = 0; i < mobileDevices.length; i++) {
        if (navigator.userAgent.match(mobileDevices[i])) {
            return true;
        }
    }
    return false
}

function capture() {
    var canvas = document.createElement("canvas");
    var video = document.querySelector("video");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas
        .getContext("2d")
        .drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    saveToLocal(canvas.toDataURL('image/jpeg'), moment().format('YYYY-MM-DDTHH:mm') + '.png', 'image/octet-stream');

}

function saveToLocal(blob, name, mimeType) {
    if (!blob) return

    const a = document.createElement('a')
    a.style.display = 'none'
    a.download = name
    if (typeof blob === 'string') {
        a.href = blob
    } else {
        blob =
            blob instanceof Blob
                ? blob
                : new Blob(blob instanceof Array ? blob : [blob], {
                    type: mimeType
                })
        a.href = URL.createObjectURL(blob)
    }

    setTimeout(() => {
        a.click()
    }, 0)
    setTimeout(() => {
        a.remove()
    }, 1)

    if (blob instanceof Blob) {
        setTimeout(() => {
            URL.revokeObjectURL(blob)
        }, 1000)
    }
}