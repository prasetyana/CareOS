export interface Theme {
    id: string;
    name: string;
    description: string;
    image: string;
}

export const themes: Theme[] = [
    {
        id: 'default',
        name: 'Default',
        description: 'Tata letak standar dengan fitur lengkap, cocok untuk restoran dengan banyak menu dan promosi.',
        image: '/themes/default.png'
    },
    {
        id: 'minimal',
        name: 'Minimal',
        description: 'Tata letak bersih dan sederhana yang berfokus pada konten penting dan kemudahan navigasi.',
        image: '/themes/minimal.png'
    }
];
