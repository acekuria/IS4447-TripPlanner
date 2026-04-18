import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import PrimaryButton from '../components/ui/primary-button';

describe('PrimaryButton', () => {
  it('renders the label text', () => {
    const { getByText } = render(<PrimaryButton label="Save" onPress={() => {}} />);
    expect(getByText('Save')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<PrimaryButton label="Go" onPress={onPress} />);
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<PrimaryButton label="Go" onPress={onPress} disabled />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('renders secondary variant without throwing', () => {
    const { getByText } = render(
      <PrimaryButton label="Cancel" onPress={() => {}} variant="secondary" />
    );
    expect(getByText('Cancel')).toBeTruthy();
  });

  it('renders danger variant without throwing', () => {
    const { getByText } = render(
      <PrimaryButton label="Delete" onPress={() => {}} variant="danger" />
    );
    expect(getByText('Delete')).toBeTruthy();
  });
});
