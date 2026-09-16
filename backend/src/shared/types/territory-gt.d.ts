declare module 'territory-gt' {
    function departamentos(): string[];
    function municipios(): Record<string, string[]>;
    function municipios(departamento: string): string[] | undefined;
    function cabecera(departamento: string): string | undefined;

    const GT: { 
        departamentos: typeof departamentos;
        municipios: typeof municipios;
        cabecera: typeof cabecera;
    };

    export default GT;
}