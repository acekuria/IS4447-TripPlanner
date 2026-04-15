import { render, waitFor } from '@testing-library/react-native';
import IndexScreen from '../app/(tabs)/index';
import { StudentContext } from '../app/_layout';

jest.mock('@/db/client', () => ({
    db: {
        select: jest.fn(),
        insert: jest.fn(),
    },
}));

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
}));

jest.mock('react-native-safe-area-context', () => {
    const { View } = require('react-native');
    return { SafeAreaView: View };
});

const mockStudent = {
    id: 1,
    name: 'Test Student',
    major: 'Computer Science',
    year: '3',
    count: 0,
};

describe('IndexScreen', () => {
    it('renders the student and the add button', async () => {
        const { getByText } = render(
            <StudentContext.Provider value={{ students: [mockStudent], setStudents: jest.fn() }}>
                <IndexScreen />
            </StudentContext.Provider>
        );

        await waitFor(() => {
            expect(getByText('Test Student')).toBeTruthy();
            expect(getByText('Add Student')).toBeTruthy();
        });

    });
});
