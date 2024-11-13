import { Observable } from "@apollo/client";

const promiseToObservable = (promise) =>
  new Observable((subscriber) => {
    promise.then(
      (value) => {
        if (!subscriber.closed) {
          subscriber.next(value);
          subscriber.complete();
        }
      },
      (error) => subscriber.error(error)
    );
  });

export default promiseToObservable;
