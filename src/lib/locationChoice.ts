const KEY = 'carsila_location_choice';

export const readLocationChoice = () => {
  const value = localStorage.getItem(KEY);
  return value === 'yes' || value === 'no' ? value : '';
};

export const saveLocationChoice = (value: 'yes' | 'no') => {
  localStorage.setItem(KEY, value);
};
