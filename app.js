'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Muhib Rahman',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-08-02T17:01:17.194Z',
    '2021-08-04T23:36:17.929Z',
    '2021-08-05T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-08-04T14:43:26.374Z',
    '2020-08-06T18:49:59.371Z',
    '2021-08-08T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT',
};

const accounts = [account1, account2];

//selecting dom Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// // implement date functionality
const formatMovementDate = function (date, locale) {
  const calDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else {
  //   const day = `${date.getDate()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }

  return new Intl.DateTimeFormat(locale).format(date);
};

// Implement formatted currency
const formatCurrency = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// display movement value based on movements array
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  // sorting feature
  const sorting = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // 1. loop on movement array
  sorting.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const currencyFormat = formatCurrency(mov, acc.locale, acc.currency);

    // 2. create html elements
    const html = `
          <div class="movements__row">
            <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
            <div class="movements__value">${currencyFormat}</div>
         </div>`;

    // 3. display html elements
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// calculate and display movement total value in the balance
const calMovementBln = function (acc) {
  acc.balance = acc.movements.reduce((acc, currMov) => acc + currMov, 0);
  labelBalance.textContent = formatCurrency(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

// calculate and display summary
const calSummaryBln = function (acc) {
  const income = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, currMov) => acc + currMov, 0);
  labelSumIn.textContent = formatCurrency(income, acc.locale, acc.currency);

  const outcome = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, currMov) => acc + currMov, 0);
  labelSumOut.textContent = formatCurrency(
    Math.abs(outcome),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(intRate => (intRate * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int);
  labelSumInterest.textContent = formatCurrency(
    interest,
    acc.locale,
    acc.currency
  );
};

// create user name
const createUserName = function (userAcc) {
  userAcc.forEach(function (acc) {
    acc.userName = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUserName(accounts);

// update UI

const updateUI = function (acc) {
  displayMovements(acc);
  calMovementBln(acc);
  calSummaryBln(acc);
};

// implement user logout timer
const logOutTimer = function () {
  let time = 120;
  const tick = function () {
    const min = String(Math.floor(time / 60)).padStart(2, 0);
    const sec = String(Math.floor(time % 60)).padStart(2, 0);

    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get start';
      containerApp.style.opacity = 0;
    }
    time--;
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// implementing login feature
let currLoginAcc, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currLoginAcc = accounts.find(
    acc => acc.userName === inputLoginUsername.value
  );

  if (currLoginAcc?.pin === Number(inputLoginPin.value)) {
    // update ui
    labelWelcome.textContent = `Welcome Back, ${
      currLoginAcc.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 1;

    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currLoginAcc.locale,
      options
    ).format(now);

    // clear input fields value after login
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = logOutTimer();
    // update ui
    updateUI(currLoginAcc);
  }
});

// implementing transfer feature
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.userName === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currLoginAcc.balance >= amount &&
    receiverAcc?.userName !== currLoginAcc.userName
  ) {
    currLoginAcc.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // add transfer date
    currLoginAcc.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // update UI
    updateUI(currLoginAcc);

    // reset timer
    clearInterval(timer);
    timer = logOutTimer();
  }
});

// implementing loan request feature
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount > 0 &&
    currLoginAcc.movements.some(acc => acc >= loanAmount * 0.1)
  ) {
    setTimeout(() => {
      currLoginAcc.movements.push(loanAmount);
      currLoginAcc.movementsDates.push(new Date().toISOString());

      updateUI(currLoginAcc);

      // reset timer
      clearInterval(timer);
      timer = logOutTimer();
    }, 3000);
  }
  inputLoanAmount.value = '';
});

// implementing delete account feature
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    inputCloseUsername.value === currLoginAcc.userName &&
    Number(inputClosePin.value) === currLoginAcc.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.userName === currLoginAcc.userName
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

// sorting event handler
let sorted = false;

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currLoginAcc, !sorted);
  sorted = !sorted;
});

// /////////////////////////////////////////////////
// /////////////////////////////////////////////////
