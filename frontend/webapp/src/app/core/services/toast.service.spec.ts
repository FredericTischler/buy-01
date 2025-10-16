import { fakeAsync, tick } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
  });

  it('should register and auto-dismiss toasts', fakeAsync(() => {
    const id = service.show({ title: 'Hello world', autoClose: 20 });
    expect(service.toasts().length).toBe(1);

    tick(21);
    expect(service.toasts().length).toBe(0);

    service.dismiss(id); // should be no-op after auto close
    expect(service.toasts().length).toBe(0);
  }));
});
