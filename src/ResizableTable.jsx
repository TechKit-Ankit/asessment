import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import './ResizableReorderableTable.css';

const PAGE_SIZE = 3;

const ResizableTable = () => {
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    const [columns, setColumns] = useState([
        { name: 'ID', resizable: true, reorderable: true, sortable: true, visible: true },
        { name: 'Name', resizable: true, reorderable: true, sortable: true, visible: true },
        { name: 'Age', resizable: true, reorderable: true, sortable: true, visible: true },
        { name: 'Country', resizable: true, reorderable: true, sortable: true, visible: true },
        { name: 'Salary', resizable: true, reorderable: true, sortable: true, visible: true },
        { name: 'Date Joined', resizable: true, reorderable: true, sortable: true, visible: true },
    ]);

    const [data, setData] = useState([
        { id: 1, name: 'Bimal', age: 30, country: 'USA', salary: 50000, dateJoined: '2022-01-01' },
        { id: 2, name: 'Ashis', age: 25, country: 'Canada', salary: 60000, dateJoined: '2022-02-01' },
        { id: 3, name: 'Ankit', age: 28, country: 'India', salary: 45000, dateJoined: '2022-03-01' },
        { id: 4, name: 'Sunil', age: 35, country: 'Australia', salary: 70000, dateJoined: '2022-04-01' },
        { id: 5, name: 'Ramesh', age: 32, country: 'UK', salary: 55000, dateJoined: '2022-05-01' },
        { id: 6, name: 'Suresh', age: 29, country: 'Germany', salary: 80000, dateJoined: '2022-06-01' },
        { id: 7, name: 'Praveen', age: 31, country: 'France', salary: 75000, dateJoined: '2022-07-01' },
        { id: 8, name: 'Suresh', age: 34, country: 'Japan', salary: 90000, dateJoined: '2022-08-01' },
    ]);

    const [sortConfig, setSortConfig] = useState(() => {
        const sortableColumns = columns.filter((column) => column.sortable);

        if (sortableColumns.length > 0) {
            return sortableColumns.map((column) => ({
                key: column.name.toLowerCase(),
                direction: 'ascending',
            }));
        } else {
            return [];
        }
    });
    const [filterConfig, setFilterConfig] = useState({});
    const [globalSearch, setGlobalSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(0);

    const sortedAndFilteredData = React.useMemo(() => {
        let filteredData = [...data];

        // Apply global search
        if (globalSearch) {
            const searchValue = globalSearch.toLowerCase();
            filteredData = filteredData.filter((item) => {
                return Object.values(item).some((value) => String(value).toLowerCase().includes(searchValue));
            });
        }

        // Apply filters
        for (const key in filterConfig) {
            if (filterConfig[key]) {
                filteredData = filteredData.filter((item) => {
                    const columnValue = key === 'date joined'
                        ? formatDate(item['dateJoined']).toLowerCase()
                        : String(item[key]).toLowerCase();
                    return columnValue.includes(filterConfig[key].toLowerCase());
                });
            }
        }

        if (sortConfig.length > 0) {
            filteredData.sort((a, b) => {
                for (const { key, direction } of sortConfig) {
                    const keyToUse = key.toLowerCase() === 'date joined' ? 'dateJoined' : key.toLowerCase();

                    if (keyToUse === 'datejoined') {
                        const dateA = new Date(a[keyToUse]);
                        const dateB = new Date(b[keyToUse]);

                        if (direction === 'ascending') {
                            return dateA.getTime() - dateB.getTime();
                        } else {
                            return dateB.getTime() - dateA.getTime();
                        }
                    } else {
                        if (a[keyToUse] < b[keyToUse]) {
                            return direction === 'ascending' ? -1 : 1;
                        } else if (a[keyToUse] > b[keyToUse]) {
                            return direction === 'ascending' ? 1 : -1;
                        }
                    }
                }
                return 0;
            });
        }

        return filteredData;
    }, [data, sortConfig, filterConfig, globalSearch]);



    const paginatedData = sortedAndFilteredData.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

    const totalPages = Math.ceil(sortedAndFilteredData.length / PAGE_SIZE);

    const requestSort = (key) => {
        let direction = 'ascending';
        const newSortConfig = [...sortConfig];
        const existingSortIndex = newSortConfig.findIndex((config) => config.key === key);

        if (existingSortIndex !== -1) {
            direction = newSortConfig[existingSortIndex].direction === 'ascending' ? 'descending' : 'ascending';
            newSortConfig.splice(existingSortIndex, 1);
        }

        newSortConfig.unshift({ key, direction });
        setSortConfig(newSortConfig);
    };

    const handleResize = (columnIndex, newSize) => {
        setColumns((prevColumns) => {
            const updatedColumns = [...prevColumns];
            updatedColumns[columnIndex].width = newSize;
            return updatedColumns;
        });
    };

    const handleReorder = (sourceIndex, destinationIndex) => {
        setColumns((prevColumns) => {
            const updatedColumns = [...prevColumns];
            const [movedColumn] = updatedColumns.splice(sourceIndex, 1);
            updatedColumns.splice(destinationIndex, 0, movedColumn);
            return updatedColumns;
        });
    };

    const handleFilterChange = (key, value) => {
        setFilterConfig((prevFilterConfig) => ({
            ...prevFilterConfig,
            [key]: value,
        }));
    };

    const handleGlobalSearch = (value) => {
        setGlobalSearch(value);
    };

    const handleColumnToggle = (columnName) => {
        setColumns((prevColumns) => {
            const updatedColumns = [...prevColumns];
            const targetColumnIndex = updatedColumns.findIndex(
                (column) => column.name.toLowerCase() === columnName.toLowerCase()
            );

            if (targetColumnIndex !== -1) {
                updatedColumns[targetColumnIndex].visible = !updatedColumns[targetColumnIndex].visible;
            }

            return updatedColumns;
        });
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div style={{ margin: '20px', backgroundColor: '#F3EEEA' }}>
            <div style={{ marginBottom: '10px' }}>
                <input
                    type="text"
                    placeholder="Search in the whole table"
                    value={globalSearch}
                    onChange={(e) => handleGlobalSearch(e.target.value)}
                    style={{ padding: '8px', width: '300px', backgroundColor: '#FFCF96' }}
                />
            </div>
            <div style={{ marginBottom: '10px', display: 'flex' }}>
                {columns.map((column, index) => (
                    <label key={index} style={{ marginRight: '10px', display: 'flex', alignItems: 'center', backgroundColor: '#FFF6F6' }}>
                        <input
                            type="checkbox"
                            checked={column.visible}
                            onChange={() => handleColumnToggle(column.name)}
                            style={{ marginRight: '5px' }}
                        />
                        {` ${column.name}`}
                    </label>
                ))}
            </div>
            <Table striped bordered style={{ border: '1px solid black', width: '100%', marginBottom: '20px' }}>
                <thead>
                    <tr>
                        {columns
                            .filter((column) => column.visible)
                            .map((column, index) => (
                                <th
                                    key={index}
                                    style={{
                                        width: column.width,
                                        border: '1px solid black',
                                        textAlign: 'center',
                                    }}
                                    className={`${column.resizable ? 'resizable' : ''} ${column.reorderable ? 'reorderable' : ''
                                        }`}
                                    draggable={column.reorderable}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('text/plain', '');
                                        e.dataTransfer.effectAllowed = 'move';
                                        e.dataTransfer.setData('text', index);
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const sourceIndex = parseInt(e.dataTransfer.getData('text'), 10);
                                        handleReorder(sourceIndex, index);
                                    }}
                                >
                                    {(column.name !== 'Date Joined') && (
                                        <>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                onClick={() => requestSort(column.name.toLowerCase(), 'ascending')}
                                            >
                                                {column.name}
                                                <span> ▲</span>
                                            </button>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                onClick={() => requestSort(column.name.toLowerCase(), 'descending')}
                                            >
                                                <span> ▼</span>
                                            </button>
                                        </>
                                    )}
                                    {column.name === 'Date Joined' && (
                                        <>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                onClick={() => requestSort(column.name.toLowerCase(), 'ascending')}
                                            >
                                                {column.name}
                                                <span> ▲</span>
                                            </button>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                                                onClick={() => requestSort(column.name.toLowerCase(), 'descending')}
                                            >
                                                <span> ▼</span>
                                            </button>
                                        </>
                                    )}
                                    <input
                                        type="text"
                                        placeholder={`Search ${column.name}`}
                                        value={filterConfig[column.name.toLowerCase()] || ''}
                                        onChange={(e) =>
                                            handleFilterChange(column.name.toLowerCase(), e.target.value)
                                        }
                                    />
                                </th>
                            ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            {columns.map(
                                (column, columnIndex) =>
                                    column.visible && (
                                        <td
                                            key={columnIndex}
                                            className={column.visible ? '' : 'column-hidden'}
                                            style={{
                                                border: '1px solid #dee2e6',
                                                padding: '8px',
                                                textAlign: column.width === 'auto' ? 'center' : '',
                                            }}
                                        >
                                            {column.name === 'Date Joined'
                                                ? formatDate(row['dateJoined'])
                                                : row[column.name.toLowerCase()]}
                                        </td>
                                    )
                            )}
                        </tr>
                    ))}
                </tbody>
            </Table>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#B0A695' }}>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 0} style={{ marginRight: '5px' }}>
                    Previous
                </button>
                <span>{`Page ${currentPage + 1} of ${totalPages}`}</span>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages - 1} style={{ marginLeft: '5px' }}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default ResizableTable;
