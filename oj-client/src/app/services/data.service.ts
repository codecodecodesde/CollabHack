import { Injectable } from '@angular/core';
import { Problem } from '../models/problem.model';
//import { PROBLEMS } from '../mock-problems';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class DataService {
  //problems: Problem[] = PROBLEMS;
  private _problemSource = new BehaviorSubject<Problem[]>([]);

  constructor(private httpClient: HttpClient) { }

  getProblems() : Observable<Problem[]> {
    //return this.problems;
    this.httpClient.get('api/v1/problems')
      .toPromise()
      .then((res: any) => {
        this._problemSource.next(res);
      })
      .catch(this.handlerError);
    return this._problemSource.asObservable();
  }

  getProblem(id: number): Promise<Problem> {
    //return this.problems.find((problem) => problem.id === id );
    return this.httpClient.get(`api/v1/problems/${id}`)
      .toPromise()
      .then((res: any) => {
        return res
      })
      .catch(this.handlerError);
  }

  addProblem(problem: Problem){
    // problem.id = this.problems.length + 1;
    // this.problems.push(problem);
    const options = { headers: new HttpHeaders({'Content-Type': 'application/json'})};
    return this.httpClient.post('api/v1/problems', problem, options)
      .toPromise()
      .then((res: any) => {
        this.getProblems();
        return res;
      })
      .catch(this.handlerError);
  }

  private handlerError(error: any): Promise<any> {
    return Promise.reject(error.body || error);
  }

}
