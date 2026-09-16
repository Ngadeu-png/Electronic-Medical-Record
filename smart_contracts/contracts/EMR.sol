// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EMR {
    address public owner;
    uint256 public recordCount = 0;

    struct Record {
        uint256 id;
        address patient;
        address doctor;
        string dataHash; // IPFS / storage reference
        uint256 timestamp;
    }

    mapping(uint256 => Record) public records;
    mapping(address => uint256[]) public patientRecords;

    event RecordCreated(uint256 indexed id, address indexed patient, address indexed doctor, string dataHash, uint256 timestamp);

    modifier onlyOwner(){
        require(msg.sender == owner, "not owner");
        _;
    }

    constructor(){
        owner = msg.sender;
    }

    function createRecord(address _patient, address _doctor, string memory _dataHash) public returns (uint256){
        uint256 id = ++recordCount;
        records[id] = Record(id, _patient, _doctor, _dataHash, block.timestamp);
        patientRecords[_patient].push(id);
        emit RecordCreated(id, _patient, _doctor, _dataHash, block.timestamp);
        return id;
    }

    function getRecordsForPatient(address _patient) public view returns (uint256[] memory){
        return patientRecords[_patient];
    }

    function getRecord(uint256 _id) public view returns (Record memory){
        return records[_id];
    }

    function setOwner(address _newOwner) public onlyOwner{
        owner = _newOwner;
    }
}
