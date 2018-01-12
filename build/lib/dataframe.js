"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var empty_iterable_1 = require("./iterables/empty-iterable");
var count_iterable_1 = require("./iterables/count-iterable");
var multi_iterable_1 = require("./iterables/multi-iterable");
var select_iterable_1 = require("./iterables/select-iterable");
var csv_rows_iterable_1 = require("./iterables/csv-rows-iterable");
var Sugar = require("sugar");
var index_1 = require("./index");
var extract_element_iterable_1 = require("./iterables/extract-element-iterable");
var skip_iterable_1 = require("./iterables/skip-iterable");
var Table = require('easy-table');
var chai_1 = require("chai");
var series_1 = require("./series");
var column_names_iterable_1 = require("./iterables/column-names-iterable");
var BabyParse = require("babyparse");
;
//
// Helper function to map an array of objects.
//
function toMap(items, keySelector, valueSelector) {
    var output = {};
    try {
        for (var items_1 = __values(items), items_1_1 = items_1.next(); !items_1_1.done; items_1_1 = items_1.next()) {
            var item = items_1_1.value;
            var key = keySelector(item);
            output[key] = valueSelector(item);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (items_1_1 && !items_1_1.done && (_a = items_1.return)) _a.call(items_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return output;
    var e_1, _a;
}
//
// Helper function to only return distinct items.
//
function makeDistinct(items, selector) {
    var set = {};
    var output = [];
    try {
        for (var items_2 = __values(items), items_2_1 = items_2.next(); !items_2_1.done; items_2_1 = items_2.next()) {
            var item = items_2_1.value;
            var key = selector && selector(item) || item;
            if (!set[key]) {
                // Haven't yet seen this key.
                set[key] = true;
                output.push(item);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (items_2_1 && !items_2_1.done && (_a = items_2.return)) _a.call(items_2);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return output;
    var e_2, _a;
}
/**
 * Class that represents a dataframe of indexed values.
 */
var DataFrame = /** @class */ (function () {
    /**
     * Create a dataframe.
     *
     * @param config This can be either an array or a config object the sets the values that the dataframe contains.
     * If it is an array it specifies the values that the dataframe contains.
     * If it is a config object that can contain:
     *      values: Optional array or iterable of values that the dataframe contains.
     *      index: Optional array or iterable of values that index the dataframe, defaults to a dataframe of integers from 1 and counting upward.
     *      pairs: Optional iterable of pairs (index and value) that the dataframe contains.
     */
    function DataFrame(config) {
        //
        // Records if a dataframe is baked into memory.
        //
        this.isBaked = false;
        if (config) {
            if (Sugar.Object.isArray(config)) {
                this.initFromArray(config);
            }
            else {
                this.initFromConfig(config);
            }
        }
        else {
            this.initEmpty();
        }
    }
    //
    // Initialise this DataFrame from an array.
    //
    DataFrame.prototype.initFromArray = function (arr) {
        this.index = new count_iterable_1.CountIterable();
        this.values = arr;
        this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        if (arr.length > 0) {
            this.columnNames = Object.keys(arr[0]);
        }
        else {
            this.columnNames = [];
        }
    };
    //
    // Initialise an empty DataFrame.
    //
    DataFrame.prototype.initEmpty = function () {
        this.index = new empty_iterable_1.EmptyIterable();
        this.values = new empty_iterable_1.EmptyIterable();
        this.pairs = new empty_iterable_1.EmptyIterable();
        this.columnNames = new empty_iterable_1.EmptyIterable();
    };
    DataFrame.prototype.initColumnNames = function (inputColumnNames) {
        var outputColumnNames = [];
        var columnNamesMap = {};
        try {
            // Search for duplicate column names.
            for (var inputColumnNames_1 = __values(inputColumnNames), inputColumnNames_1_1 = inputColumnNames_1.next(); !inputColumnNames_1_1.done; inputColumnNames_1_1 = inputColumnNames_1.next()) {
                var columnName = inputColumnNames_1_1.value;
                var columnNameLwr = columnName.toLowerCase();
                if (columnNamesMap[columnNameLwr] === undefined) {
                    columnNamesMap[columnNameLwr] = 1;
                }
                else {
                    columnNamesMap[columnNameLwr] += 1;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (inputColumnNames_1_1 && !inputColumnNames_1_1.done && (_a = inputColumnNames_1.return)) _a.call(inputColumnNames_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var columnNoMap = {};
        try {
            for (var inputColumnNames_2 = __values(inputColumnNames), inputColumnNames_2_1 = inputColumnNames_2.next(); !inputColumnNames_2_1.done; inputColumnNames_2_1 = inputColumnNames_2.next()) {
                var columnName = inputColumnNames_2_1.value;
                var columnNameLwr = columnName.toLowerCase();
                if (columnNamesMap[columnNameLwr] > 1) {
                    var curColumnNo = 1;
                    // There are duplicates of this column.
                    if (columnNoMap[columnNameLwr] !== undefined) {
                        curColumnNo = columnNoMap[columnNameLwr];
                    }
                    outputColumnNames.push(columnName + "." + curColumnNo);
                    columnNoMap[columnNameLwr] = curColumnNo + 1;
                }
                else {
                    // No duplicates.
                    outputColumnNames.push(columnName);
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (inputColumnNames_2_1 && !inputColumnNames_2_1.done && (_b = inputColumnNames_2.return)) _b.call(inputColumnNames_2);
            }
            finally { if (e_4) throw e_4.error; }
        }
        return outputColumnNames;
        var e_3, _a, e_4, _b;
    };
    DataFrame.prototype.initIterable = function (input, fieldName) {
        if (Sugar.Object.isArray(input)) {
            return input;
        }
        else if (Sugar.Object.isFunction(input[Symbol.iterator])) {
            // Assume it's an iterable.
            return input;
        }
        else {
            throw new Error("Expected '" + fieldName + "' field of DataFrame config object to be an array of values or an iterable of values.");
        }
    };
    ;
    //
    // Initialise the DataFrame from a config object.
    //
    DataFrame.prototype.initFromConfig = function (config) {
        if (config.columns) {
            chai_1.assert.isObject(config.columns, "Expected 'columns' member of 'config' parameter to DataFrame constructor to be an object with fields that define columns.");
            var columnNames = Object.keys(config.columns);
            var columnIterables = [];
            try {
                for (var columnNames_1 = __values(columnNames), columnNames_1_1 = columnNames_1.next(); !columnNames_1_1.done; columnNames_1_1 = columnNames_1.next()) {
                    var columnName = columnNames_1_1.value;
                    var columnIterable = this.initIterable(config.columns[columnName], columnName);
                    columnIterables.push(columnIterable);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (columnNames_1_1 && !columnNames_1_1.done && (_a = columnNames_1.return)) _a.call(columnNames_1);
                }
                finally { if (e_5) throw e_5.error; }
            }
            this.columnNames = columnNames;
            this.values = new csv_rows_iterable_1.CsvRowsIterable(columnNames, new multi_iterable_1.MultiIterable(columnIterables));
        }
        else {
            if (config.columnNames) {
                this.columnNames = this.initColumnNames(config.columnNames);
            }
            if (config.values) {
                this.values = this.initIterable(config.values, 'values');
                if (config.columnNames) {
                    // Convert data from rows to columns.
                    this.values = new csv_rows_iterable_1.CsvRowsIterable(this.columnNames, this.values);
                }
                else {
                    this.columnNames = new column_names_iterable_1.ColumnNamesIterable(this.values, config.considerAllRows || false);
                }
            }
            else if (config.pairs) {
                this.values = new extract_element_iterable_1.ExtractElementIterable(config.pairs, 1);
                if (!this.columnNames) {
                    this.columnNames = new column_names_iterable_1.ColumnNamesIterable(this.values, config.considerAllRows || false);
                }
            }
            else {
                this.values = new empty_iterable_1.EmptyIterable();
                if (!this.columnNames) {
                    this.columnNames = new empty_iterable_1.EmptyIterable();
                }
            }
        }
        if (config.index) {
            this.index = this.initIterable(config.index, 'index');
        }
        else if (config.pairs) {
            this.index = new extract_element_iterable_1.ExtractElementIterable(config.pairs, 0);
        }
        else {
            this.index = new count_iterable_1.CountIterable();
        }
        if (config.pairs) {
            this.pairs = config.pairs;
        }
        else {
            this.pairs = new multi_iterable_1.MultiIterable([this.index, this.values]);
        }
        if (config.baked !== undefined) {
            this.isBaked = config.baked;
        }
        var e_5, _a;
    };
    /**
     * Get an iterator to enumerate the values of the dataframe.
     * Enumerating the iterator forces lazy evaluation to complete.
     */
    DataFrame.prototype[Symbol.iterator] = function () {
        return this.values[Symbol.iterator]();
    };
    /**
     * Get the names of the columns in the dataframe.
     *
     * @returns Returns an array of the column names in the dataframe.
     */
    DataFrame.prototype.getColumnNames = function () {
        return Array.from(this.columnNames);
    };
    /**
     * Get the index for the dataframe.
     */
    DataFrame.prototype.getIndex = function () {
        return new index_1.Index({ values: this.index });
    };
    /**
     * Apply a new index to the DataFrame.
     *
     * @param newIndex The new index to apply to the DataFrame.
     *
     * @returns Returns a new dataframe or dataframe with the specified index attached.
     */
    DataFrame.prototype.withIndex = function (newIndex) {
        if (!Sugar.Object.isArray(newIndex)) {
            chai_1.assert.isObject(newIndex, "'Expected 'newIndex' parameter to 'DataFrame.withIndex' to be an array, DataFrame or Index.");
        }
        return new DataFrame({
            values: this.values,
            index: newIndex,
        });
    };
    /**
     * Resets the index of the dataframe back to the default zero-based sequential integer index.
     *
     * @returns Returns a new dataframe with the index reset to the default zero-based index.
     */
    DataFrame.prototype.resetIndex = function () {
        return new DataFrame({
            values: this.values // Just strip the index.
        });
    };
    /**
     * Retreive a series from a column of the dataframe.
     *
     * @param columnName Specifies the name of the column that contains the series to retreive.
     */
    DataFrame.prototype.getSeries = function (columnName) {
        chai_1.assert.isString(columnName, "Expected 'columnName' parameter to 'DataFrame.getSeries' function to be a string that specifies the name of the column to retreive.");
        return new series_1.Series({
            values: new select_iterable_1.SelectIterable(this.values, function (row) { return row[columnName]; }),
            index: this.index,
        });
    };
    /**
 * Returns true if the column with the requested name exists in the dataframe.
 *
 * @param columnName - Name of the column to check.
 */
    DataFrame.prototype.hasSeries = function (columnName) {
        var columnNameLwr = columnName.toLowerCase();
        try {
            for (var _a = __values(this.getColumnNames()), _b = _a.next(); !_b.done; _b = _a.next()) {
                var existingColumnName = _b.value;
                if (existingColumnName.toLowerCase() === columnNameLwr) {
                    return true;
                }
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_6) throw e_6.error; }
        }
        return false;
        var e_6, _c;
    };
    /**
     *
     * Verify the existance of a column and return it.
     * Throws an exception if the column doesn't exist.
     *
     * @param columnName - Name or index of the column to retreive.
     */
    DataFrame.prototype.expectSeries = function (columnName) {
        if (!this.hasSeries(columnName)) {
            throw new Error("Expected dataframe to contain series with column name: '" + columnName + "'.");
        }
        return this.getSeries(columnName);
    };
    /**
     * Create a new dataframe with an additional column specified by the passed-in series.
     *
     * @param columnNameOrSpec - The name of the column to add or replace.
     * @param [series] - When columnNameOrSpec is a string that identifies the column to add, this specifies the Series to add to the data-frame or a function that produces a series (given a dataframe).
     *
     * @returns Returns a new dataframe replacing or adding a particular named column.
     */
    DataFrame.prototype.withSeries = function (columnNameOrSpec, series) {
        if (!Sugar.Object.isObject(columnNameOrSpec)) {
            chai_1.assert.isString(columnNameOrSpec, "Expected 'columnNameOrSpec' parameter to 'DataFrame.withSeries' function to be a string that specifies the column to set or replace.");
            if (!Sugar.Object.isFunction(series)) {
                chai_1.assert.isObject(series, "Expected 'series' parameter to 'DataFrame.withSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            chai_1.assert.isUndefined(series, "Expected 'series' parameter to 'DataFrame.withSeries' to not be set when 'columnNameOrSpec is an object.");
        }
        if (Sugar.Object.isObject(columnNameOrSpec)) {
            var columnNames = Object.keys(columnNameOrSpec);
            var workingDataFrame = this;
            try {
                for (var columnNames_2 = __values(columnNames), columnNames_2_1 = columnNames_2.next(); !columnNames_2_1.done; columnNames_2_1 = columnNames_2.next()) {
                    var columnName = columnNames_2_1.value;
                    workingDataFrame = workingDataFrame.withSeries(columnName, columnNameOrSpec[columnName]);
                }
            }
            catch (e_7_1) { e_7 = { error: e_7_1 }; }
            finally {
                try {
                    if (columnNames_2_1 && !columnNames_2_1.done && (_a = columnNames_2.return)) _a.call(columnNames_2);
                }
                finally { if (e_7) throw e_7.error; }
            }
            return workingDataFrame;
        }
        var importSeries;
        if (Sugar.Object.isFunction(series)) {
            importSeries = series(this);
        }
        else {
            importSeries = series;
        }
        var seriesValueMap = toMap(importSeries.toPairs(), function (pair) { return pair[0]; }, function (pair) { return pair[1]; });
        var newColumnNames = makeDistinct(this.getColumnNames().concat([columnNameOrSpec])); //TODO: This could be lazy.
        return new DataFrame({
            columnNames: newColumnNames,
            index: this.index,
            pairs: new select_iterable_1.SelectIterable(this.pairs, function (pair) {
                var index = pair[0];
                var value = pair[1];
                var modified = Object.assign({}, value);
                modified[columnNameOrSpec] = seriesValueMap[index];
                return [
                    index,
                    modified
                ];
            }),
        });
        var e_7, _a;
    };
    /**
     * Add a series if it doesn't already exist.
     *
     * @param columnNameOrSpec - The name of the series to add or a column spec that defines the new column.
     * @param series - The series to add to the dataframe. Can also be a function that returns the series.
     *
     * @returns Returns a new dataframe with the specified series added, if the series didn't already exist. Otherwise if the requested series already exists the same dataframe is returned.
     */
    DataFrame.prototype.ensureSeries = function (columnNameOrSpec, series) {
        if (!Sugar.Object.isObject(columnNameOrSpec)) {
            chai_1.assert.isString(columnNameOrSpec, "Expected 'columnNameOrSpec' parameter to 'DataFrame.ensureSeries' function to be a string that specifies the column to set or replace.");
            if (!Sugar.Object.isFunction(series)) {
                chai_1.assert.isObject(series, "Expected 'series' parameter to 'DataFrame.ensureSeries' to be a Series object or a function that takes a dataframe and produces a Series.");
            }
        }
        else {
            chai_1.assert.isUndefined(series, "Expected 'series' parameter to 'DataFrame.ensureSeries' to not be set when 'columnNameOrSpec is an object.");
        }
        if (Sugar.Object.isObject(columnNameOrSpec)) {
            var columnNames = Object.keys(columnNameOrSpec);
            var workingDataFrame = this;
            try {
                for (var columnNames_3 = __values(columnNames), columnNames_3_1 = columnNames_3.next(); !columnNames_3_1.done; columnNames_3_1 = columnNames_3.next()) {
                    var columnName = columnNames_3_1.value;
                    workingDataFrame = workingDataFrame.ensureSeries(columnName, columnNameOrSpec[columnName]);
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (columnNames_3_1 && !columnNames_3_1.done && (_a = columnNames_3.return)) _a.call(columnNames_3);
                }
                finally { if (e_8) throw e_8.error; }
            }
            return workingDataFrame;
        }
        if (this.hasSeries(columnNameOrSpec)) {
            return this; // Already have the series.
        }
        else {
            return this.withSeries(columnNameOrSpec, series);
        }
        var e_8, _a;
    };
    /**
    * Extract values from the dataframe as an array.
    * This forces lazy evaluation to complete.
    *
    * @returns Returns an array of values contained within the dataframe.
    */
    DataFrame.prototype.toArray = function () {
        var values = [];
        try {
            for (var _a = __values(this.values), _b = _a.next(); !_b.done; _b = _a.next()) {
                var value = _b.value;
                values.push(value);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_9) throw e_9.error; }
        }
        return values;
        var e_9, _c;
    };
    /**
     * Retreive the index and values from the DataFrame as an array of pairs.
     * Each pair is [index, value].
     * This forces lazy evaluation to complete.
     *
     * @returns Returns an array of pairs that contains the dataframe content. Each pair is a two element array that contains an index and a value.
     */
    DataFrame.prototype.toPairs = function () {
        var pairs = [];
        try {
            for (var _a = __values(this.pairs), _b = _a.next(); !_b.done; _b = _a.next()) {
                var pair = _b.value;
                pairs.push(pair);
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_10) throw e_10.error; }
        }
        return pairs;
        var e_10, _c;
    };
    /**
     * Bake the data frame to an array of rows.
     *
     *  @returns Returns an array of rows. Each row is an array of values in column order.
     */
    DataFrame.prototype.toRows = function () {
        var columnNames = this.getColumnNames();
        var rows = [];
        try {
            for (var _a = __values(this.values), _b = _a.next(); !_b.done; _b = _a.next()) {
                var value = _b.value;
                var row = [];
                for (var columnIndex = 0; columnIndex < columnNames.length; ++columnIndex) {
                    row.push(value[columnNames[columnIndex]]);
                }
                rows.push(row);
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return rows;
        var e_11, _c;
    };
    /**
     * Generate a new dataframe based by calling the selector function on each value.
     *
     * @param selector Selector function that transforms each value to create a new dataframe.
     *
     * @returns Returns a new dataframe that has been transformed by the selector function.
     */
    DataFrame.prototype.select = function (selector) {
        chai_1.assert.isFunction(selector, "Expected 'selector' parameter to 'DataFrame.select' function to be a function.");
        return new DataFrame({
            values: new select_iterable_1.SelectIterable(this.values, selector),
            index: this.index,
        });
    };
    /**
     * Skip a number of values in the dataframe.
     *
     * @param numValues - Number of values to skip.     *
     * @returns Returns a new dataframe or dataframe with the specified number of values skipped.
     */
    DataFrame.prototype.skip = function (numValues) {
        return new DataFrame({
            values: new skip_iterable_1.SkipIterable(this.values, numValues),
            index: new skip_iterable_1.SkipIterable(this.index, numValues),
            pairs: new skip_iterable_1.SkipIterable(this.pairs, numValues),
        });
    };
    /**
     * Format the dataframe for display as a string.
     * This forces lazy evaluation to complete.
     *
     * @returns Generates and returns a string representation of the dataframe or dataframe.
     */
    DataFrame.prototype.toString = function () {
        var columnNames = this.getColumnNames();
        var header = ["__index__"].concat(columnNames);
        var pairs = this.toPairs();
        var table = new Table();
        pairs.forEach(function (pair) {
            var index = pair[0];
            var value = pair[1];
            table.cell(header[0], index);
            columnNames.forEach(function (columnName, columnIndex) {
                table.cell(header[columnIndex + 1], value[columnName]);
            });
            table.newRow();
        });
        return table.toString();
    };
    /**
     * Forces lazy evaluation to complete and 'bakes' the dataframe into memory.
     *
     * @returns Returns a dataframe that has been 'baked', all lazy evaluation has completed.
     */
    DataFrame.prototype.bake = function () {
        if (this.isBaked) {
            // Already baked.
            return this;
        }
        return new DataFrame({
            pairs: this.toPairs(),
            baked: true,
        });
    };
    /**
     * Serialize the dataframe to JSON.
     *
     *  @returns Returns a JSON format string representing the dataframe.
     */
    DataFrame.prototype.toJSON = function () {
        return JSON.stringify(this.toArray(), null, 4);
    };
    /**
     * Serialize the dataframe to CSV.
     *
     *  @returns Returns a CSV format string representing the dataframe.
     */
    DataFrame.prototype.toCSV = function () {
        var data = [this.getColumnNames()].concat(this.toRows());
        return BabyParse.unparse(data);
    };
    return DataFrame;
}());
exports.DataFrame = DataFrame;
//# sourceMappingURL=dataframe.js.map