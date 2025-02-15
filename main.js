class Book {
    constructor(id, title, author, year, isComplete) {
        this.id = id || Date.now().toString();
        this.title = title;
        this.author = author;
        this.year = year;
        this.isComplete = isComplete;
    }
}

const STORAGE_KEY = 'BOOKSHELF_APPS';
const saveBooks = (books) => localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
const loadBooks = () => JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const bookForm = document.getElementById('bookForm');
const searchForm = document.getElementById('searchBook');
const searchInput = document.getElementById('searchBookTitle');
const clearSearchBtn = document.getElementById('clearSearch');
const incompleteList = document.getElementById('incompleteBookList');
const completeList = document.getElementById('completeBookList');
const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
let bookToDelete = null;

incompleteList.innerHTML = '';
completeList.innerHTML = '';

const updateFormMode = () => {
    const formHeader = document.getElementById('formTitle');
    const formCard = document.getElementById('formCard');
    const submitButton = document.getElementById('bookFormSubmit');
    const cancelButton = document.getElementById('bookFormCancel');

    if (editingBookId) {
        formHeader.textContent = "Edit Buku";
        formCard.classList.remove('bg-primary');
        formCard.classList.add('bg-warning');
        submitButton.innerHTML = '<i class="bi bi-save"></i> Simpan Perubahan';
        cancelButton.classList.remove('d-none');
    } else {
        formHeader.textContent = "Tambah Buku Baru";
        formCard.classList.remove('bg-warning');
        formCard.classList.add('bg-primary');
        submitButton.innerHTML = '<i class="bi bi-plus-lg"></i> Tambah Buku';
        cancelButton.classList.add('d-none');
    }
};

const updateSubmitButtonText = updateFormMode;

const cancelEdit = () => {
    editingBookId = null;
    bookForm.reset();
    document.getElementById('bookFormIsCompleteNo').checked = true;
    updateFormMode();
};

let books = loadBooks();
let editingBookId = null;

const addBook = (book) => {
    if (editingBookId) {
        books = books.map(b => b.id === editingBookId ? book : b);
        editingBookId = null;
    } else {
        books.push(book);
    }
    saveBooks(books);
    renderBooks();
    updateFormMode();
};

const deleteBook = (bookId) => {
    books = books.filter(book => book.id !== bookId);
    saveBooks(books);
    renderBooks();
};

const toggleBookStatus = (bookId) => {
    books = books.map(book => {
        if (book.id === bookId) {
            return { ...book, isComplete: !book.isComplete };
        }
        return book;
    });
    saveBooks(books);
    renderBooks();
};

const editBook = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (book) {
        editingBookId = bookId;
        document.getElementById('bookFormTitle').value = book.title;
        document.getElementById('bookFormAuthor').value = book.author;
        document.getElementById('bookFormYear').value = book.year;
        const radioButton = book.isComplete ? 'bookFormIsCompleteYes' : 'bookFormIsCompleteNo';
        document.getElementById(radioButton).checked = true;
        updateSubmitButtonText();

        bookForm.scrollIntoView({ behavior: 'smooth' });
    }
};

const createBookElement = (book) => {
    return `
        <div data-bookid="${book.id}" data-testid="bookItem" class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h3 class="h5 mb-1" data-testid="bookItemTitle">${book.title}</h3>
                    <p class="text-muted mb-1 small" data-testid="bookItemAuthor">Penulis: ${book.author}</p>
                    <p class="text-muted mb-0 small" data-testid="bookItemYear">Tahun: ${book.year}</p>
                </div>
                <div class="btn-group">
                    <button data-testid="bookItemIsCompleteButton" class="btn btn-sm btn-outline-primary">
                        <i class="bi ${book.isComplete ? 'bi-book' : 'bi-book-fill'}"></i>
                        ${book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca'}
                    </button>
                    <button data-testid="bookItemDeleteButton" class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                        Hapus Buku
                    </button>
                    <button data-testid="bookItemEditButton" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-pencil"></i>
                        Edit Buku
                    </button>
                </div>
            </div>
        </div>
    `;
};

const renderBooks = (searchTerm = '') => {
    const filteredBooks = searchTerm
        ? books.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()))
        : books;

    incompleteList.innerHTML = filteredBooks
        .filter(book => !book.isComplete)
        .map(createBookElement)
        .join('') || '<div class="text-center p-3">Tidak ada buku</div>';

    completeList.innerHTML = filteredBooks
        .filter(book => book.isComplete)
        .map(createBookElement)
        .join('') || '<div class="text-center p-3">Tidak ada buku</div>';


    document.querySelectorAll('[data-bookid]').forEach(element => {
        const bookId = element.dataset.bookid;
        const book = books.find(b => b.id === bookId);

        element.querySelector('[data-testid="bookItemIsCompleteButton"]')
            .addEventListener('click', () => toggleBookStatus(bookId));

        element.querySelector('[data-testid="bookItemDeleteButton"]')
            .addEventListener('click', () => {
                bookToDelete = bookId;
                document.getElementById('deleteBookTitle').textContent = book.title;
                deleteModal.show();
            });

        element.querySelector('[data-testid="bookItemEditButton"]')
            .addEventListener('click', () => editBook(bookId));
    });
};

document.getElementById('confirmDelete').addEventListener('click', () => {
    if (bookToDelete) {
        deleteBook(bookToDelete);
        bookToDelete = null;
        deleteModal.hide();
    }
});

const clearSearch = () => {
    searchInput.value = '';
    clearSearchBtn.classList.add('d-none');
    renderBooks();
};

searchInput.addEventListener('input', (e) => {
    clearSearchBtn.classList.toggle('d-none', !e.target.value);
    renderBooks(e.target.value);
});

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    renderBooks(searchInput.value);
});

clearSearchBtn.addEventListener('click', clearSearch);

bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const book = new Book(
        editingBookId,
        e.target.bookFormTitle.value,
        e.target.bookFormAuthor.value,
        parseInt(e.target.bookFormYear.value),
        e.target.bookFormIsComplete.value === "true"
    );
    addBook(book);
    e.target.reset();
    document.getElementById('bookFormIsCompleteNo').checked = true;
    updateSubmitButtonText();
});

document.querySelectorAll('input[name="bookFormIsComplete"]')
    .forEach(radio => radio.addEventListener('change', updateSubmitButtonText));

document.getElementById('bookFormCancel').addEventListener('click', cancelEdit);

updateSubmitButtonText();
renderBooks();
