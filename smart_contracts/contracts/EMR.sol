// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EMR {
    address public owner;
    uint256 public recordCount = 0;

    struct Record {
        uint256 id;
        string patientRef;
        string doctorRef;
        string dataHash;
        uint256 timestamp;
    }

    mapping(uint256 => Record) public records;
    mapping(string => uint256[]) private patientRecords;

    event RecordCreated(uint256 indexed id, string patientRef, string doctorRef, address indexed submitter, string dataHash, uint256 timestamp);

    modifier onlyOwner(){
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(){
        owner = msg.sender;
    }

    function createRecord(string memory _patientRef, string memory _doctorRef, string memory _dataHash) public returns (uint256){
        uint256 id = ++recordCount;
        records[id] = Record(id, _patientRef, _doctorRef, _dataHash, block.timestamp);
        patientRecords[_patientRef].push(id);
        emit RecordCreated(id, _patientRef, _doctorRef, msg.sender, _dataHash, block.timestamp);
        return id;
    }

    function getRecordsForPatient(string memory _patientRef) public view returns (uint256[] memory){
        return patientRecords[_patientRef];
    }

    function getRecord(uint256 _id) public view returns (Record memory){
        return records[_id];
    }

    function setOwner(address _newOwner) public onlyOwner{
        owner = _newOwner;
    }
}
