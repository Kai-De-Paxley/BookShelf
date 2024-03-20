document.addEventListener('DOMContentLoaded', function () {
    const masukanbuku = document.getElementById('form');
    masukanbuku.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    if (isStorageExist()) {
      loadDataFromStorage();
    }
});


function addBook() {
    const title = document.getElementById('judul').value;
    const author = document.getElementById('penulis').value;
    const genre = document.getElementById('jenis').value;
    const year = document.getElementById('date').value;
   
    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, genre, parseInt(year), false);
    Book.push(bookObject);
   
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
  }


function generateId() {
     return +new Date();
}

function generateBookObject(id, title, author, genre, year, isCompleted) {
    return {
      id,
      title,
      author,
      genre,
      year,
      isCompleted,
    }
  }

const Book = [];
const RENDER_EVENT = 'render-Book';


document.addEventListener(RENDER_EVENT, function () {
  console.log(Book);
});


function makeBook(bookObject) {
  const texttitle = document.createElement('h5');
  texttitle.innerText = bookObject.title;
 
  const textauthor = document.createElement('p');
  textauthor.innerText = bookObject.author;

  const textgenre = document.createElement('p');
  textgenre.innerText = bookObject.genre;

  const texttimestamp = document.createElement('p');
  texttimestamp.innerText = bookObject.year;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
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
       movebtn.innerText = 'Belum selesai dibaca';

       movebtn.addEventListener('click', function () {
        moveToUnCompletedList(bookObject.id);
      });

      container.append(remove, movebtn);
    } 
       else {
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

     container.append(movebtn, remove)
  }

  return container;
}


function moveToCompletedList (bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  if (confirm('Apakah ingin memindahkan ke daftar sudah dibaca?'))

  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
 }


 function findBook(bookId) {
   for (const bookItem of Book) {
    if (bookItem.id === bookId) {
       return bookItem;
    }
  }

  return null;
}


document.addEventListener(RENDER_EVENT, function () {
   const ListBook = document.getElementById('Books');
   ListBook.innerHTML = '';

   const completedBookList = document.getElementById('Selesai');
   completedBookList.innerHTML = '';
 
  for (const bookItem of Book) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isCompleted) 
      ListBook.append(bookElement);

    else
    completedBookList.append(bookElement);

  }  
});


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

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

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

document.querySelector('#search-input').addEventListener('input', listtitle);

function listtitle(){
  const searchForm = document.querySelector('#search-input');
  const title = searchForm.value.toLowerCase();
  const booklibrary = document.querySelectorAll('.inner');

  booklibrary.forEach((item) =>{
    let text = item.textContent;
    if(text.toLowerCase().includes(title.toLowerCase())){
      item.style.display = '';
    }
    else{
      item.style.display = 'none';
    }
  });
}


