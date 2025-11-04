import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatFcfa',
  standalone: true
})
export class FormatFcfaPipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value === undefined || value === null) {
      return '';
    }
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' FCFA';
  }
}
