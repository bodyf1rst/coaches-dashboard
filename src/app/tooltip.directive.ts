import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements AfterViewInit {

  constructor(private el: ElementRef) { }

  ngAfterViewInit() {
    const tooltipTriggerEl = this.el.nativeElement;
    if (tooltipTriggerEl.getAttribute('data-bs-title')) {
      new (window as any).bootstrap.Tooltip(tooltipTriggerEl);
    }
  }
}
