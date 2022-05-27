#include <iostream>
#include <vector>
#include <algorithm>
#include <random>
#include <math.h>

using namespace std;

typedef struct Element{
    int key;
} Element;


void printArr(vector<Element>& elementArr){
    for (auto e : elementArr){
        if (e.key > 0) cout << e.key << " ";
    }
    cout << endl;
    cout << endl;
}

void fixHeap(vector<Element>& heap, int heapSize, int root, Element k){
    // root is actually the index of the root element within the heap
    int left = 2 * root; // index of left of root
    int right = 2 * root + 1; // index of right of root
    // if root is leaf
    if (left >= heapSize) heap[root] = k;
    // else root is not leaf
    else {
        int largerSubHeap;
        // key value of left subtree
        int leftSubTreeRootValue = heap[left].key;
        // key value of right subtree
        int rightSubTreeRootValue = heap[right].key;

        // determine the larger subheap
        if (leftSubTreeRootValue > rightSubTreeRootValue){
            largerSubHeap = left;
        }
        else largerSubHeap = right;

        // get larger subheap's root value
        int largerSubHeapRootValue = heap[largerSubHeap].key;

        // if k is larger than the subheaps' root value, there's no need to recurse further.
        // set root's key value to k's key value
        if (k.key >= largerSubHeapRootValue) heap[root].key = k.key;
        // else we need to move the larger value up a level.
        else {
            // set root's key value to the larger subheaps's root's key value
            heap[root].key = heap[largerSubHeap].key;
            // recurse from larger subheap. k's position hasn't been found yet.
            fixHeap(heap, heapSize, largerSubHeap, k);
        }
    }
    return;
}

void constructHeap(vector<Element>& elementArr, int heapSize, int root){
    int leftIndex = root * 2;
    int rightIndex = root * 2 + 1;
    // if H is not a leaf
    if (leftIndex < heapSize){
        constructHeap(elementArr, heapSize, leftIndex);
        constructHeap(elementArr, heapSize, rightIndex);
        Element K = elementArr[root];
        fixHeap(elementArr, heapSize, root, K);
    }
    return;
}

void heapSort(vector<Element>& elementArr, int size){
    constructHeap(elementArr, size, 1);
    int heapSize = size;
    for (; heapSize >= 2; heapSize--){
        Element curMax = elementArr[1];
        Element K = elementArr[heapSize];
        fixHeap(elementArr, heapSize, 1, K);
        elementArr[heapSize] = curMax;
    }
    return;
}

void merge(vector<Element>& elementArr, int start, int mid, int end){
    int subArrayLeftSize = mid - start + 1;
    int subArrayRightSize = end - mid;

    int subArrayLeftIndex = 0;
    int subArrayRightIndex = 0;

    int subArrayLeftIndexOffset = start;
    int subArrayRightIndexOffset = mid + 1;
    int mergedArrayIndex = start;
    vector<Element> tempArray;
    tempArray.resize(elementArr.size());
    //printArr(tempArray);
    while (subArrayLeftIndex < subArrayLeftSize && subArrayRightIndex < subArrayRightSize){
        int leftIndex = subArrayLeftIndex + subArrayLeftIndexOffset;
        int rightIndex = subArrayRightIndex + subArrayRightIndexOffset;
        int leftKey = elementArr[leftIndex].key;
        int rightKey = elementArr[rightIndex].key;

        if (leftKey < rightKey){
            tempArray[mergedArrayIndex] = elementArr[leftIndex];
            subArrayLeftIndex++;
        }
        else {
            tempArray[mergedArrayIndex] = elementArr[rightIndex];
            subArrayRightIndex++;
        }
        mergedArrayIndex++;
    }

    while(subArrayLeftIndex < subArrayLeftSize){
        int leftIndex = subArrayLeftIndex + subArrayLeftIndexOffset;
        tempArray[mergedArrayIndex] = elementArr[leftIndex];
        mergedArrayIndex++;
        subArrayLeftIndex++;
    }

    while(subArrayRightIndex < subArrayRightSize){
        int rightIndex = subArrayRightIndex + subArrayRightIndexOffset;
        tempArray[mergedArrayIndex] = elementArr[rightIndex];
        mergedArrayIndex++;
        subArrayRightIndex++;
    }

    for (int i = start; i <= end; i++){
        elementArr[i] = tempArray[i];
    }
    //printArr(elementArr);
}

void mergeSort(vector<Element>& elementArr, int const start, int const end){
    if (start >= end) return;
    int center = start + (end - start) * 0.5;
    //cout << "START: " << start << " CENTER: " << center << " END: " << end << endl;
    mergeSort(elementArr, start, center);
    //cout << "BSTART: " << start << " CENTER: " << center << " END: " << end << endl;
    mergeSort(elementArr, center + 1, end);
    merge(elementArr, start, center, end);
}


int partition(vector<Element>& elementArr, int first, int last){
    int pivot = elementArr[last].key;
    int leftIndex = first;
    int rightIndex = last - 1;

    while(leftIndex < rightIndex){ 
        while(elementArr[leftIndex].key < pivot) leftIndex++;
        while(elementArr[rightIndex].key > pivot) rightIndex--;
        if (leftIndex >= rightIndex) break;
        swap(elementArr[leftIndex], elementArr[rightIndex]);
    }
    swap(elementArr[leftIndex], elementArr[last]);
    return leftIndex;
}

int partition2(vector<Element>& elementArr, int first, int last){
    int pivot = elementArr[last].key;
    int i = first - 1;
    for (int j = first; j <= last - 1; j++){
        if (elementArr[j].key < pivot){
            i++;
            swap(elementArr[i], elementArr[j]);
        }
    }
    swap(elementArr[i + 1], elementArr[last]);
    return i + 1;
}

int partition3(vector<Element>& elementArr, int first, int last){
    int pivot = elementArr[first].key;
    int leftIndex = first;
    int rightIndex = last - 1;

    while(leftIndex < rightIndex){ 
        while(elementArr[leftIndex].key < pivot) leftIndex++;
        while(elementArr[rightIndex].key > pivot) rightIndex--;
        if (leftIndex >= rightIndex) break;
        swap(elementArr[leftIndex], elementArr[rightIndex]);
    }
    swap(elementArr[leftIndex], elementArr[last]);
    return leftIndex;
}


void quickSort(vector<Element>& elementArr, int first, int last){
    if (first >= last) return;
    int pivotIndex = partition(elementArr, first, last);
    quickSort(elementArr, first, pivotIndex - 1);
    quickSort(elementArr, pivotIndex + 1, last);
}

// insertion sort
void insertionSort(vector<Element>& elementArr){
    int index = 1;
    int currentKey, predIndex;
    int arrSize = elementArr.size();
    for (; index < arrSize; index++){
        currentKey = elementArr[index].key;
        // 지금 비교할 대상(currentKey)을 이 전에 있는 것들과 비교하기 위해 predIndex(predecessor index)를 index - 1으로 설정  
        predIndex = index - 1;

        while(predIndex >= 0 && elementArr[predIndex].key > currentKey){
            elementArr[predIndex + 1].key = elementArr[predIndex].key;
            predIndex--;
        }
        elementArr[predIndex + 1].key = currentKey;
    }
}


int median(vector<int> subArray){
    sort(subArray.begin(), subArray.end());
    int medianIndex = subArray.size() /2;
    return subArray[medianIndex];
}

// find the element with order k in elementArr using the median of medians approach
int selection(vector<int>& elementArr, int k){
    if (elementArr.size() <= 5){
        sort(elementArr.begin(), elementArr.end());
        return elementArr[k - 1];
    }

    int subArrayNum = ceil(elementArr.size() / 5.0);
    vector<int> medianArr;
    
    int subArrayStartIndex = 0;
    for (; subArrayStartIndex < subArrayNum; subArrayStartIndex++){
        vector<int> subArray;
        for (int offset = 0; offset < 5; offset++){
            int index = subArrayStartIndex * 5 + offset;
            if (index < elementArr.size()){
                subArray.push_back(elementArr[index]);
            }
        }
        medianArr.push_back(median(subArray));
    }

    int medianOfMedians = selection(medianArr, subArrayNum / 2);
    int pivot = medianOfMedians;

    vector<int> s1, s2;
    for (int i = 0; i < elementArr.size(); i++){
        int elem = elementArr[i];
        if (elem < pivot) s1.push_back(elem);
        else if (elem > pivot) s2.push_back(elem);
    }

    if (s1.size() + 1 == k) return pivot;
    else if (s1.size() >= k) return selection(s1, k);
    else return selection(s2, k - s1.size() - 1);
}




int main(){
    
    vector<int> randomIntArr;
    int elemNum = 100;
    for (int i = 0; i < elemNum; i++){
        randomIntArr.push_back(i + 1);
    }
    auto rng = default_random_engine{};
    // shuffle array
    shuffle(randomIntArr.begin(), randomIntArr.end(), rng);
    
    vector<Element> elementArr;
    vector<Element> heapsortArr;
    Element heapZeroIndexElem;
    heapZeroIndexElem.key = -1;
    heapsortArr.push_back(heapZeroIndexElem);

    for (int i = 0; i < elemNum; i++){
        Element e;
        e.key = randomIntArr[i];
        elementArr.push_back(e);   
        heapsortArr.push_back(e);
    }

    cout << "SHUFFLED ARRAY: ";
    printArr(heapsortArr);

    heapSort(heapsortArr, heapsortArr.size() - 1);
    cout << "HEAP SORT: ";
    printArr(heapsortArr);

    shuffle(elementArr.begin(), elementArr.end(), rng);
    cout << "SHUFFLED ARRAY: ";
    printArr(elementArr);

    mergeSort(elementArr, 0, elemNum - 1);
    cout << "MERGE SORT: ";
    printArr(elementArr);

    shuffle(elementArr.begin(), elementArr.end(), rng);
    cout << "SHUFFLED ARRAY: ";
    printArr(elementArr);

    quickSort(elementArr, 0, elementArr.size() - 1);
    cout << "QUICK SORT: ";
    printArr(elementArr);

    shuffle(elementArr.begin(), elementArr.end(), rng);
    cout << "SHUFFLED ARRAY: ";
    printArr(elementArr);

    insertionSort(elementArr);
    cout << "INSERTION SORT: ";
    printArr(elementArr);
    
    cout << selection(randomIntArr, 99) << endl;

    return 0;
}