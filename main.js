/*
  1. render song
  2. scroll top
  3. play/pause/seek
  4. cd rotate
  5. next/prev
  6. random
  7. next/repeat when ended
  8. active song
  9. scroll active song into view
  10. play song when click

*/

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MHIU_MUSIC'

const cd = $('.cd') 
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $(".playlist");

const app = {
  currentIndex: 0, //lấy ra chỉ mục đầu tiên của mảng (set cho bài hát đầu tiên)
  isPlaying: false, //để set tạm dừng, tiếp tục
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  songs: [
    {
      name: "Xa nhau cả hai đều buồn",
      singer: "DBlue",
      path: "./assets/music/xanhaucahaideubuon.mp3",
      image: "./assets/img/xnc2db.webp"
    },
    {
      name: "Đừng nghe máy",
      singer: "Sivan",
      path: "./assets/music/dungnghemay.mp3",
      image: "./assets/img/dnm.webp"
    }
    ,
    {
      name: "Bước qua nhau",
      singer: "Vũ",
      path: "./assets/music/buocquanhau.mp3",
      image: "./assets/img/bqn.webp"
    },
    {
      name: "Đừng kể ai nghe",
      singer: "DBlue",
      path: "./assets/music/dungkeainghe.mp3",
      image: "./assets/img/dkan.webp"
    },
    {
      name: "Tình đầu",
      singer: "Tăng Duy Tân",
      path: "./assets/music/tinhdau.mp3",
      image: "./assets/img/td.webp"
    },
    {
      name: "Dưới cơn mưa",
      singer: "Helia",
      path: "./assets/music/duoiconmua.mp3",
      image: "./assets/img/dcm.webp"
    },
    {
      name: "Thôi trễ rồi, chắc anh phải về đây",
      singer: "Taynguyensound",
      path: "./assets/music/3.mp3",
      image: "./assets/img/avt.webp"
    },
    {
      name: "Túy",
      singer: "Taynguyensound",
      path: "./assets/music/4.mp3",
      image: "./assets/img/avt.webp"
    },
    {
      name: "Đi qua hoa cúc",
      singer: "Taynguyensound",
      path: "./assets/music/5.mp3",
      image: "./assets/img/diquahoacuc.webp"
    },
  ],
  setConfig: function(key, value) {
    this.config[key] = value;
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  render: function(){
    const htmls = this.songs.map((song, index) => {
      return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
      <div class="thumb" style="background-image: url('${song.image}')">
      </div>
      <div class="body">
        <h3 class="title">${song.name}</h3>
        <p class="author">${song.singer}</p>
      </div>
      <div class="option">
        <i class="fas fa-ellipsis-h"></i>
      </div>
    </div>`
    })
    playlist.innerHTML = htmls.join('')
  },
  defineProperties: function(){
    Object.defineProperty(this, 'currentSong',{
      get: function(){
        return this.songs[this.currentIndex]
      }
    })
  },
  handleEvents: function(){ //xử lí về event
    const cdWidth = cd.offsetWidth //lấy ra Width của cd

    //xử lí cd xoay, dừng
    const cdThumbAnimate = cdThumb.animate([
      { transform: 'rotate(360deg)' } //cho xoay 360 độ
    ],{
      duration: 10000, //10 giây
      iterations: Infinity //xoay vô hạn
    })
    cdThumbAnimate.pause()

    //phóng to thu nhỏ cd
    document.onscroll = function(){ //lắng nghe sự kiện scroll
      const scrollTop = window.scrollY || document.documentElement.scrollTop 
      const newCdWidth = cdWidth - scrollTop

      cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0  //nếu cdWidth > 0 thì trả vể style + px, nếu k thì trả về 0
      cd.style.opacity = newCdWidth / cdWidth //lấy tỷ lệ set Opacity mờ dần

    }

    //xử lí khi click play button
    playBtn.onclick = function(){
      if (app.isPlaying) { //nếu đang chạy -> click -> tắt, k thì ngược lại  
        audio.pause()       
      } else {
        audio.play() //event làm việc với mp3, mp4, 
      }
    }

    //khi song được play
    audio.onplay = function(){
      app.isPlaying = true
      player.classList.add('playing') //add class playing vào, cho chạy
      cdThumbAnimate.play()
    }

    //khi pause
    audio.onpause = function(){
      app.isPlaying = false
      player.classList.remove('playing')
      cdThumbAnimate.pause()
    }

    //thanh chạy tiến độ
    audio.ontimeupdate = function(){
      if (audio.duration) { //duration lấy ra số giây
        const progressPercent = Math.floor(audio.currentTime / audio.duration * 100) //lấy ra phần trăm, math.floor làm tròn
        progress.value = progressPercent
      }
    }

    //xử lí khi tua
    progress.onchange = function(e){
      const seekTime = audio.duration / 100 * e.target.value //lấy ra số giây
      audio.currentTime = seekTime
    }

    //khi next bài hát
    nextBtn.onclick = function(){
      if (app.isRandom) {
        app.playRandomSong()
      }else{
        app.nextSong()
      }
      audio.play()
      app.render()
      app.scrollToActiveSong()
    }

    //khi prev bài hát
    prevBtn.onclick = function(){
      if (app.isRandom) {
        app.playRandomSong()
      }else{
        app.prevSong()
      }
      audio.play()
      app.render()
      app.scrollToActiveSong()
    }

    //xử lí khi bật / tắt random song
    randomBtn.onclick = function(e){
      app.isRandom = !app.isRandom
      app.setConfig('isRandom', app.isRandom)
      randomBtn.classList.toggle('active', app.isRandom)
    }

    //lặp lại bài 
    repeatBtn.onclick = function(e){
      app.isRepeat = !app.isRepeat
      app.setConfig('isRepeat', app.isRepeat)
      repeatBtn.classList.toggle('active', app.isRepeat)
    }

    //next song khi end bài hát
    audio.onended = function(){
      if (app.isRepeat) {
        audio.play()
      }else{
        nextBtn.click() //khi hết bài sẽ auto ấn next
      }
    }

    //lắng nghe click vào playlist
    playlist.onclick = function(e){
      const songNode = e.target.closest('.song:not(.active)')
      if (songNode || e.target.closest('.option')){
        //xử lí khi click vào song
        if(songNode){
          app.currentIndex = Number(songNode.dataset.index)
          app.loadCurrentSong()
          audio.play()
          app.render() //render lại cho active lên
        }
        //xử lí khi click vào song option
        if(e.target.closest('.option')){

        }
      }
    }
  },
  scrollToActiveSong: function(){
    setTimeout(() => {
      $('.song .active').scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      })
    }, 300) //delay 500mili
  },

  loadCurrentSong: function(){
    //gán 
    heading.textContent = this.currentSong.name
    cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
    audio.src = this.currentSong.path
  },

  loadConfig: function(){
    this.isRandom = this.config.isRandom
    this.isRepeat = this.config.isRepeat
  },
  nextSong: function(){
    app.currentIndex++
    if(this.currentIndex >= this.songs.length) {
      this.currentIndex = 0
    }

    this.loadCurrentSong() //cho load lại, khi next sẽ tải thông tin mới
  },
  prevSong: function(){
    app.currentIndex--
    if(this.currentIndex < 0) {
      this.currentIndex = this.songs.length - 1
    }

    this.loadCurrentSong() //cho load lại, khi next sẽ tải thông tin mới
  },
  playRandomSong: function(){
    let newIndex
    do {
      newIndex = Math.floor(Math.random() * this.songs.length) //random song
    }while (newIndex === this.currentIndex) //ko cho trùng bài hát hiện tại

    this.currentIndex = newIndex
    this.loadCurrentSong() 
  },
  start: function(){
    this.loadConfig()//gán cấu hình từ config vào ứng dụng
    this.defineProperties() //định nghĩa các thuộc tính cho object
    this.handleEvents() //lắng nghe, xử lí các sự kiện (DOM events)
    this.loadCurrentSong() //load bài hát hiện tại vào UI khi chạy
    this.render() //render lại playlist

    //hiển thị trạng thái ban đầu của button reapeat và random
    randomBtn.classList.toggle('active', app.isRandom)
    repeatBtn.classList.toggle('active', app.isRepeat)
  }
} 

app.start()