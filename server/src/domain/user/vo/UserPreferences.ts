import { ValueObject } from '../../shared/ValueObject.js';
import type { CurrencyCode } from '../../shared/types/money.js';

interface UserPreferencesProps {
  theme: 'light' | 'dark';
  currency: CurrencyCode;
  dateFormat: string;
  timezone: string;
}

export class UserPreferences extends ValueObject<UserPreferencesProps> {
  get theme(): 'light' | 'dark' { return this.props.theme; }
  get currency(): CurrencyCode { return this.props.currency; }
  get dateFormat(): string { return this.props.dateFormat; }
  get timezone(): string { return this.props.timezone; }

  static create(props: Partial<UserPreferencesProps> = {}): UserPreferences {
    return new UserPreferences({
      theme: props.theme ?? 'light',
      currency: props.currency ?? 'USD',
      dateFormat: props.dateFormat ?? 'YYYY-MM-DD',
      timezone: props.timezone ?? 'UTC',
    });
  }

  merge(changes: Partial<UserPreferencesProps>): UserPreferences {
    return new UserPreferences({ ...this.props, ...changes });
  }
}
