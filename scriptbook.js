document.addEventListener('DOMContentLoaded', function () {
    const masukanbuku = document.getElementById('form');
    masukanbuku.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    document.getElementById('update-button').addEventListener('click', function (event) {
      event.preventDefault();
      updateBook();
  });
    //ini untuk JSON
    if (isStorageExist()) {
      loadDataFromStorage();
    }
});


const Book = [];
//Custom event ini digunakan sebagai patokan dasar ketika ada perubahan data pada variabel todos, seperti perpindahan todo (dari incomplete menjadi complete, dan sebaliknya), menambah todo, maupun menghapus todo. 
const RENDER_EVENT = 'render-Book';
function addBook() {
    const title = document.getElementById('judul').value;
    const author = document.getElementById('penulis').value;
    const genre = document.getElementById('jenis').value;
    const year = document.getElementById('date').value;
   
    const generatedID = +new Date();  //berfungsi untuk mendapatkan id unik dalam buku
    //ini untuk membuat object baru dengan valur dari element diatas
    const bookObject = generateBookObject(generatedID, 
      title, author, genre, parseInt(year), false);
    Book.push(bookObject);
   
    //Setelah disimpan pada array, kita panggil sebuah custom event RENDER_EVENT menggunakan method dispatchEvent(). Custom event ini akan kita terapkan untuk me-render data yang telah disimpan pada array todos.
    document.dispatchEvent(new Event(RENDER_EVENT));
    reset()
    saveData();
  }

function generateBookObject(id, title, 
  author, genre, year,
  isCompleted) {
    return {
      id, title, author, genre, year,
      isCompleted,
    }
}

document.addEventListener(RENDER_EVENT, function () {
  console.log(Book);
});

//logika untuk mindahin bukunya jika buku di function books ada dan status iscomplete false maka akan dimasukkan ke buku yang belum di baca
//fungsi ini selalu dipanggil karena fungsi ini yang berperan untuk merefresh web dan memperbarui web 
document.addEventListener(RENDER_EVENT, function () {
  //memebrsihkan element buku container yang belum dibaca
  const ListBook = document.getElementById('Books');
  ListBook.innerHTML = '';
  //memebrsihkan element buku container yang sudah dibaca
  const completedBookList = document.getElementById('Selesai');
  completedBookList.innerHTML = '';
 
  for (const bookItem of Book) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) 
    //ini jika iscopleted == false maka akan dimasukkan ke belum selesai
      ListBook.append(bookElement);
    else
      completedBookList.append(bookElement);
  }  
});

//parameter dari function ini adalah book object yang berisi object untuk menyimpan data inputan user
function makeBook(bookObject) {
  const texttitle = document.createElement('p');

  texttitle.classList.add('titleBook')
  texttitle.innerHTML = `<span class="book-info">Judul buku: </span>${bookObject.title}`;
 
  const textauthor = document.createElement('p');
  textauthor.innerHTML = `<span class="book-info">Penulis: </span>${bookObject.author}`;

  const textgenre = document.createElement('p');
  textgenre.innerHTML = `<span class="book-info">Genre: </span>${bookObject.genre}`;;

  const texttimestamp = document.createElement('p');
  texttimestamp.innerHTML = `<span class="book-info">Tahun rilis: </span>${bookObject.year}`;;

  const textContainer = document.createElement('div');
  textContainer.classList.add('container-books');
  textContainer.append(texttitle, textauthor, textgenre, texttimestamp);
 
  const container = document.createElement('div');
  container.append(textContainer);
  container.setAttribute('id', `todo-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const remove = document.createElement('button');
        remove.classList.add('remove')
        remove.innerText = 'Hapus buku';

        remove.addEventListener('click', function () {
          removeBook(bookObject.id);
        });

        const movebtn = document.createElement('button');
        movebtn.classList.add('move');
        movebtn.innerText = 'Belum dibaca';

        movebtn.addEventListener('click', function () {
          moveToUnCompletedList(bookObject.id);
        });

        textContainer.append(remove, movebtn);
    } else {
        const movebtn = document.createElement('button');
        movebtn.classList.add('move');
        movebtn.innerText = 'Sudah dibaca';

        movebtn.addEventListener('click', function () {
          moveToCompletedList(bookObject.id);
        });

        const remove = document.createElement('button');
        remove.classList.add('remove')
        remove.innerText = 'Hapus buku';

        remove.addEventListener('click', function () {
            removeBook(bookObject.id);
        });

        //edit button
        const editBtn = document.createElement('button');
        editBtn.classList.add('edit')
        editBtn.innerText = 'Edit buku'

        editBtn.addEventListener('click', ()=> {
          editBook(bookObject.id)
        })

        textContainer.append(movebtn, remove, editBtn)
  }
  return container;
}

//parameter ini berisikian id buku
function moveToCompletedList (bookid) {
  //ini variabel yang berisi memanggil function findbook dengan parameter book id
  const bookTarget = findBook(bookid);
  //jika gak ada id buku atau buku kosong maka function akan langsung berhenti {return}
  if (bookTarget == null) return;
  if (confirm('Apakah ingin memindahkan ke daftar sudah dibaca?'))
  //setelah di pindah ke selesai dibaca maka iscompleted akan menjadi true
  bookTarget.isCompleted = true;

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}
//function ini akan looping dalam array buku yang kemudian disimpan pada variable bookitem dan akan mencocokkan id book item dengan book id di daftar dan akan mengembalikan bukunya
function findBook(bookId) {
   for (const bookItem of Book) {
    if (bookItem.id === bookId) {
       return bookItem;
    }
  }
  return null;
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  if (confirm('Apakah yakin ingin menghapus buku?'))
  Book.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in Book) {
    if (Book[index].id === bookId) {
      return index;
    }
  }
  return -1;
}
 

function moveToUnCompletedList(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  if (confirm('Apakah ingin memindahkan ke daftar belum dibaca?'))
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(Book);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOK_SHELF';
 
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      Book.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.querySelector('#search-input').addEventListener('input', serachBook);
function serachBook(){
  const searchForm = document.querySelector('#search-input');
  const inputUser = searchForm.value.toLowerCase();
  const booklibrary = document.querySelectorAll('.container-books');

  booklibrary.forEach((item) => {
    const titleBook = item.querySelector('.titleBook').textContent.toLowerCase()
    if(titleBook.includes(inputUser.toLowerCase())){
      item.style.display = '';
    }
    else{
      item.style.display = 'none';
    }
  });
}

function editBook (bookId){
  const bookIdField = document.getElementById('book-id');
  const title = document.getElementById('judul');
  const author = document.getElementById('penulis');
  const genre = document.getElementById('jenis');
  const year = document.getElementById('date');

  const bookIndex = findBookIndex(bookId)
  currentBook = Book[bookIndex]
  bookIdField.value = currentBook.id
  title.value = currentBook.title
  author.value = currentBook.author
  genre.value = currentBook.genre
  year.value = currentBook.year

  document.getElementById('submit-button').style.display ='none'
  document.getElementById('update-button').style.display = 'block'
}


function updateBook () {
  const bookId = document.getElementById('book-id').value;
  const title = document.getElementById('judul').value;
  const author = document.getElementById('penulis').value;
  const genre = document.getElementById('jenis').value;
  const year = document.getElementById('date').value;

  const bookTarget = findBook(parseInt(bookId))
  if(!bookTarget) return

  bookTarget.title = title
  bookTarget.author = author
  bookTarget.genre = genre
  bookTarget.year = parseInt(year)


  document.dispatchEvent(new Event(RENDER_EVENT))
  reset()
}


function reset() {
  document.getElementById('book-id').value = '';
  document.getElementById('judul').value = '';
  document.getElementById('penulis').value = '';
  document.getElementById('jenis').value = '';
  document.getElementById('date').value = '';

  document.getElementById('submit-button').style.display = 'block';
  document.getElementById('update-button').style.display = 'none';
}
