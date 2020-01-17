import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PriceQueryFacade } from '@coding-challenge/stocks/data-access-price-query';

@Component({
  selector: 'coding-challenge-stocks',
  templateUrl: './stocks.component.html',
  styleUrls: ['./stocks.component.css']
})
export class StocksComponent implements OnInit {
  stockPickerForm: FormGroup;
  symbol: string;

  quotes$ = this.priceQuery.priceQueries$;

  fromDate: Date = null;
  toDate: Date = null;
  showDatePicker: boolean;

  //Date selection beyond current date will be disabled in the Datepicker control
  maxDate = new Date();

  //Date selection prior to the given date below will be disabled in the Datepicker control
  minDate = new Date(2010, 0, 1);

  timePeriods = [
    { viewValue: 'All available data', value: 'max' },
    { viewValue: 'Five years', value: '5y' },
    { viewValue: 'Two years', value: '2y' },
    { viewValue: 'One year', value: '1y' },
    { viewValue: 'Year-to-date', value: 'ytd' },
    { viewValue: 'Six months', value: '6m' },
    { viewValue: 'Three months', value: '3m' },
    { viewValue: 'One month', value: '1m' },
    { viewValue: 'Custom', value: 'Custom' }
  ];

  constructor(private fb: FormBuilder, private priceQuery: PriceQueryFacade) {
    this.stockPickerForm = fb.group({
      symbol: [null, Validators.required],
      period: [null, Validators.required]
    });
  }

  ngOnInit() {}

  fetchQuote() {
    if (this.stockPickerForm.valid) {
      const {symbol, period} = this.stockPickerForm.value;
      if (period === 'Custom') {
        if (this.fromDate && this.toDate) {
          const range = this.getPeriod(this.fromDate, this.toDate);
          this.priceQuery.fetchQuote(symbol, range, this.fromDate, this.toDate);
        }
      } else {
        this.priceQuery.fetchQuote(symbol, period);
      }
    }
  }

  //Set the fromDate field and run the validation
  setFromDate(event) {
    this.fromDate = event.value;
    this.validateDates();
  }

  //Set the toDate field and run the validation
  setToDate(event) {
    this.toDate = event.value;
    this.validateDates();
  }

  //check if date selections are correct?
  validateDates() {
    if(this.fromDate && this.toDate) {
      //if wrong date selection is made, set both the dates as same (set with current date)
      if(this.fromDate > this.toDate) {
        this.fromDate = new Date();
        this.toDate = new Date();
      }
    }
  }

  //find out the range (period) between the two dates selected
  getPeriod(fromDate: Date, toDate: Date): string {
    let period = '';
    const diffInTime = fromDate.getTime() === toDate.getTime() ? 0 : new Date().getTime() - fromDate.getTime();

    if (diffInTime === 0) {
      const month = fromDate.getMonth() + 1;
      const day = fromDate.getDate() < 10 ? '0' + fromDate.getDate() : fromDate.getDate();
      period = 'date/' + fromDate.getFullYear() + (month < 10 ? '0' + month : month) + day;

      return period;
    } else {
      const days = Math.round(Math.abs(diffInTime / (1000 * 60 * 60 * 24)));
      if (days > 5 * 365)
        period = 'max';
      else if (days > (2 * 365) && days <= (5 * 365))
        period = '5y';
      else if (days > 365 && days <= (2 * 365))
        period = '2y';
      else if (days > 180 && days <= 365)
        period = '1y';
      else if (days > 90 && days <= 180)
        period = '6m';
      else if (days > 30 && days <= 90)
        period = '3m';
      else if (days > 5 && days <= 30)
        period = '1m';
      else
        period = '5d';

      return period;
    }
  }

  callDatePicker(event) {
    //Reset date picker dates
    this.fromDate = null;
    this.toDate = null;

    if (event.value === "Custom") {
      this.showDatePicker = true;
    } else {
      this.showDatePicker = false;
    }
  }
}
