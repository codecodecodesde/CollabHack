import { Component, OnInit } from '@angular/core';
import { Problem } from '../../models/problem.model';
import { DataService } from '../../services/data.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-problem-list',
  templateUrl: './problem-list.component.html',
  styleUrls: ['./problem-list.component.css']
})
export class ProblemListComponent implements OnInit {
  problems: Problem[];
  subscriptionProblems: Subscription;
  constructor(private dataService: DataService) { }

  ngOnInit() {//init problems in component by const problems outside
    this.getProblems();
  }

  ngOnDestroy(){
    this.subscriptionProblems.unsubscribe();
  }
  getProblems(){
    this.subscriptionProblems = this.dataService.getProblems()
    .subscribe(problems => this.problems = problems);
  }

}
