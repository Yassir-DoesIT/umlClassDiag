"use client";
import * as joint from 'jointjs';
import { useEffect, useState } from 'react';

const Page = () => {
    const [graph, setGraph] = useState(null);
    const [paper, setPaper] = useState(null);
    const [className, setClassName] = useState('');
    const [attributes, setAttributes] = useState('');
    const [methods, setMethods] = useState('');
    const [classes, setClasses] = useState([]);
    const [sourceClass, setSourceClass] = useState('');
    const [targetClass, setTargetClass] = useState('');
    const [relationType, setRelationType] = useState('composition');
    

    useEffect(() => {
        const newGraph = new joint.dia.Graph();
        const newPaper = new joint.dia.Paper({
            el: document.getElementById('myDiagram'),
            model: newGraph,
            width: 800,
            height: 600,
            gridSize: 10,
        });

        setGraph(newGraph);
        setPaper(newPaper);
    }, []);

    const addClassToDiagram = (e) => {
        e.preventDefault();
        if (graph && paper) {
            const uml = joint.shapes.uml;

            const newClass = new uml.Class({
                position: { x: 100 + classes.length * 200, y: 50 },
                size: { width: 180, height: 150 },
                name: className,
                attributes: attributes.split('\n'),
                methods: methods.split('\n'),
            });

            graph.addCell(newClass);
            setClasses([...classes, { name: className, cell: newClass }]);
            setClassName('');
            setAttributes('');
            setMethods('');
        }
    };

    const addRelation = (e) => {
        e.preventDefault();
        if (graph && sourceClass && targetClass && relationType) {
            const source = classes.find((c) => c.name === sourceClass);
            const target = classes.find((c) => c.name === targetClass);

            if (source && target) {
                let link;

                switch (relationType) {
                    case 'composition':
                        link = new joint.shapes.uml.Composition({ source: { id: source.cell.id }, target: { id: target.cell.id } });
                        break;
                    case 'aggregation':
                        link = new joint.shapes.uml.Aggregation({ source: { id: source.cell.id }, target: { id: target.cell.id } });
                        break;
                    case 'inheritance':
                        link = new joint.shapes.uml.Generalization({ source: { id: source.cell.id }, target: { id: target.cell.id } });
                        break;
                    default:
                        break;
                }

                graph.addCell(link);
            }
        }
    };

    
   

    return (
        <div className="relative bg-zinc-800">
            <div className="flex flex-col items-center gap-8 ">
                <div className="flex gap-8">
                    <form onSubmit={addClassToDiagram} className="bg-gray-100 border border-gray-300 p-6 rounded-lg w-96 shadow-md">
                        <h2 className="text-2xl font-semibold text-center mb-4">Ajouter une Classe UML</h2>
                        <div className="mb-4">
                            <label htmlFor="className" className="block text-sm font-medium text-gray-700">Nom de la Classe</label>
                            <input
                                type="text"
                                id="className"
                                value={className}
                                onChange={(e) => setClassName(e.target.value)}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Nom de la classe"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="attributes" className="block text-sm font-medium text-gray-700">Attributs</label>
                            <textarea
                                id="attributes"
                                value={attributes}
                                onChange={(e) => setAttributes(e.target.value)}
                                rows="3"
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="+age: int\n+gender: String"
                            />
                            <small className="text-gray-500">Séparer chaque attribut par un saut de ligne.</small>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="methods" className="block text-sm font-medium text-gray-700">Méthodes</label>
                            <textarea
                                id="methods"
                                value={methods}
                                onChange={(e) => setMethods(e.target.value)}
                                rows="3"
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="+isMammal()\n+mate()"
                            />
                            <small className="text-gray-500">Séparer chaque méthode par un saut de ligne.</small>
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition">Ajouter la Classe</button>
                    </form>

                    <form onSubmit={addRelation} className="bg-gray-100 border border-gray-300 p-6 rounded-lg w-96 shadow-md">
                        <h2 className="text-2xl font-semibold text-center mb-4">Ajouter une Relation</h2>
                        <div className="mb-4">
                            <label htmlFor="sourceClass" className="block text-sm font-medium text-gray-700">Classe Source</label>
                            <select
                                id="sourceClass"
                                value={sourceClass}
                                onChange={(e) => setSourceClass(e.target.value)}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Sélectionner une classe</option>
                                {classes.map((cls) => (
                                    <option key={cls.name} value={cls.name}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="targetClass" className="block text-sm font-medium text-gray-700">Classe Cible</label>
                            <select
                                id="targetClass"
                                value={targetClass}
                                onChange={(e) => setTargetClass(e.target.value)}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="">Sélectionner une classe</option>
                                {classes.map((cls) => (
                                    <option key={cls.name} value={cls.name}>{cls.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="relationType" className="block text-sm font-medium text-gray-700">Type de Relation</label>
                            <select
                                id="relationType"
                                value={relationType}
                                onChange={(e) => setRelationType(e.target.value)}
                                className="mt-1 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                required
                            >
                                <option value="composition">Composition</option>
                                <option value="aggregation">Agrégation</option>
                                <option value="inheritance">Héritage</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded-md hover:bg-green-700 transition">Ajouter la Relation</button>
                    </form>
                </div>

                <div id="myDiagram" className="border border-gray-300"></div>
                
            </div>
        </div>
    );
};

export default Page;
