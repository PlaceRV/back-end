import {
	InterfaceDeclaration,
	Project,
	VariableDeclarationKind,
} from 'ts-morph';

const project = new Project();
const sourceFiles = project.addSourceFilesAtPaths('src/**/*.ts');
const destFile = project.createSourceFile('./src/models.ts', '', {
	overwrite: true,
});

function createKeys(node: InterfaceDeclaration) {
	const allKeys = node.getProperties().map((p) => p.getName());
	destFile.addVariableStatement({
		isExported: true,
		declarationKind: VariableDeclarationKind.Const,
		declarations: [
			{
				name: `${node.getName()}Keys`,
				initializer: (writer) =>
					writer.write(`${JSON.stringify(allKeys)} as const`),
			},
		],
	});
}

for (const sourceFile of sourceFiles)
	for (const intfce of sourceFile.getInterfaces()) createKeys(intfce);

destFile.saveSync();
